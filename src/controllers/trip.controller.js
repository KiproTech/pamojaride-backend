// src/controllers/trips.controller.js
import { pool } from "../db.js";

// -------------------------
// Helpers
// -------------------------

// Convert any BigInt field to string
const serializeTrip = (obj) => {
  const t = { ...obj };
  for (const key in t) {
    if (typeof t[key] === "bigint") t[key] = t[key].toString();
  }
  return t;
};

// Convert UTC datetime string to local datetime string
const toLocalDatetime = (utcDatetime) => {
  const dt = new Date(utcDatetime + "Z"); // treat as UTC
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");
  const ss = String(dt.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

// -------------------------
// GET /api/trips
// -------------------------
export const getTrips = async (req, res) => {
  try {
    const driverId = Number(req.user.id);

    const result = await pool.query(
      `SELECT * FROM trips WHERE driver_id = ? ORDER BY departure_datetime DESC`,
      [driverId]
    );

    // Normalize rows (works for mysql2 [rows, fields] or just rows)
    const rows = Array.isArray(result[0]) ? result[0] : result;

    const now = new Date();
    const trips = [];

    for (let trip of rows) {
      const t = serializeTrip(trip);

      // Convert departure_datetime to local time
      t.departure_datetime = toLocalDatetime(t.departure_datetime);

      // Auto-update upcoming → ongoing if departure time passed
      if (t.status === "upcoming" && new Date(trip.departure_datetime + "Z") <= now) {
        await pool.query(`UPDATE trips SET status='ongoing' WHERE id=?`, [t.id]);
        t.status = "ongoing";
      }

      // Fetch passengers
      const bookingsResult = await pool.query(
        `SELECT b.id AS booking_id, b.seat_number, b.amount, b.payment_method, b.booking_status,
                p.id AS passenger_id, p.full_name, p.email, p.phone
         FROM bookings b
         JOIN passengers p ON b.passenger_id = p.id
         WHERE b.trip_id = ?`,
        [t.id]
      );

      const bookings = Array.isArray(bookingsResult[0]) ? bookingsResult[0] : bookingsResult;
      t.passengers = bookings.map(serializeTrip); // Serialize passengers

      trips.push(t);
    }

    res.json({ success: true, data: trips });
  } catch (err) {
    console.error("Get trips error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch trips" });
  }
};

// -------------------------
// POST /api/trips
// -------------------------
export const createTrip = async (req, res) => {
  try {
    const driverId = Number(req.user.id);
    let { start_location, end_location, departure_datetime, seats_available, price_per_seat } = req.body;

    // Convert departure_datetime to UTC string for MySQL
    const dt = new Date(departure_datetime);
    const mysqlUTC = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')} ${String(dt.getUTCHours()).padStart(2, '0')}:${String(dt.getUTCMinutes()).padStart(2, '0')}:${String(dt.getUTCSeconds()).padStart(2, '0')}`;
    departure_datetime = mysqlUTC;

    // Check if driver has active trips
    const result = await pool.query(
      `SELECT id FROM trips WHERE driver_id = ? AND status IN ('upcoming','ongoing') LIMIT 1`,
      [driverId]
    );

    const activeTrips = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;
    if (activeTrips.length > 0) {
      return res.status(400).json({ success: false, message: "You already have an active trip." });
    }

    // Insert new trip
    const insertResult = await pool.query(
      `INSERT INTO trips (driver_id, start_location, end_location, departure_datetime, seats_available, price_per_seat, status)
       VALUES (?, ?, ?, ?, ?, ?, 'upcoming')`,
      [driverId, start_location, end_location, departure_datetime, seats_available, price_per_seat]
    );

    // insertResult is an object, not an array
    const insertId = insertResult.insertId;

    if (!insertId) {
      return res.status(500).json({ success: false, message: "Failed to create trip." });
    }

    // Fetch the inserted trip
    const [tripRows] = await pool.query(`SELECT * FROM trips WHERE id = ?`, [insertId]);
    const insertedTrip = serializeTrip(tripRows[0]);
    insertedTrip.departure_datetime = toLocalDatetime(insertedTrip.departure_datetime);

    res.status(201).json({ success: true, data: insertedTrip });
  } catch (err) {
    console.error("Create trip error:", err);
    res.status(500).json({ success: false, message: "Failed to create trip" });
  }
};
// -------------------------
// PATCH /api/trips/:id/start
// -------------------------
export const startTrip = async (req, res) => {
  try {
    const driverId = Number(req.user.id);
    const tripId = req.params.id;

    // Use result directly, don't destructure
    const result = await pool.query(
      `UPDATE trips 
       SET status='ongoing' 
       WHERE id=? AND driver_id=? AND status='upcoming'`,
      [tripId, driverId]
    );

    // Normalize: mysql2 sometimes returns [rows, fields]
    const affectedRows = Array.isArray(result) && result[0]?.affectedRows !== undefined
      ? result[0].affectedRows
      : result.affectedRows;

    if (!affectedRows || affectedRows === 0) {
      return res.status(400).json({ success: false, message: "Cannot start this trip." });
    }

    res.json({ success: true, message: "Trip started" });
  } catch (err) {
    console.error("Start trip error:", err);
    res.status(500).json({ success: false, message: "Failed to start trip" });
  }
};

// -------------------------
// PATCH /api/trips/:id/complete
// -------------------------
export const completeTrip = async (req, res) => {
  try {
    const driverId = Number(req.user.id);
    const tripId = req.params.id;

    // 1️⃣ Mark trip as completed
    const result = await pool.query(
      `UPDATE trips 
       SET status='completed' 
       WHERE id=? AND driver_id=? AND status='ongoing'`,
      [tripId, driverId]
    );

    const affectedRows = Array.isArray(result) ? result[0].affectedRows : result.affectedRows;

    if (!affectedRows) {
      return res.status(400).json({ success: false, message: "Cannot complete this trip." });
    }

    // 2️⃣ Update active bookings to completed
    await pool.query(
      `UPDATE bookings
       SET booking_status='completed'
       WHERE trip_id=? AND booking_status='active'`,
      [tripId]
    );

    // 3️⃣ Update total_collected in trips
    await pool.query(
      `UPDATE trips t
       JOIN (
         SELECT trip_id, SUM(amount) AS total_amount
         FROM bookings
         WHERE trip_id=? AND booking_status='completed'
         GROUP BY trip_id
       ) b_sum ON t.id=b_sum.trip_id
       SET t.total_collected=b_sum.total_amount`,
      [tripId]
    );

    res.json({ success: true, message: "Trip completed and bookings updated" });
  } catch (err) {
    console.error("Complete trip error:", err);
    res.status(500).json({ success: false, message: "Failed to complete trip" });
  }
};
// -------------------------
// PATCH /api/trips/:id/cancel
// -------------------------
// PATCH /api/trips/:id/cancel
export const cancelTrip = async (req, res) => {
  try {
    const driverId = Number(req.user.id);
    const tripId = req.params.id;

    // Update trip status to 'cancelled' only if it's upcoming or ongoing
    const result = await pool.query(
      `UPDATE trips 
       SET status='cancelled', cancelled_by='driver', cancelled_at=NOW()
       WHERE id=? AND driver_id=? AND status IN ('upcoming','ongoing')`,
      [tripId, driverId]
    );

    // Normalize the result for mysql2
    const updateInfo = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;

    if (updateInfo.affectedRows === 0) {
      return res.status(400).json({ success: false, message: "Cannot cancel this trip." });
    }

    res.json({ success: true, message: "Trip cancelled successfully." });
  } catch (err) {
    console.error("Cancel trip error:", err);
    res.status(500).json({ success: false, message: "Failed to cancel trip" });
  }
};

// -------------------------
// GET /api/trips/:id/view
// -------------------------
export const viewTrip = async (req, res) => {
  try {
    const driverId = Number(req.user.id);
    const tripId = req.params.id;

    const result = await pool.query(
      `SELECT id, created_at, departure_datetime, price_per_seat, seats_available, start_location, end_location
       FROM trips
       WHERE id = ? AND driver_id = ?`,
      [tripId, driverId]
    );

    // Normalize rows
    const rows = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const trip = { ...rows[0] };

    // Convert BigInt IDs if necessary
    if (typeof trip.id === "bigint") trip.id = trip.id.toString();

    // Convert departure_datetime & created_at to local strings
    const dtDeparture = new Date(trip.departure_datetime + "Z");
    trip.departure_datetime = `${dtDeparture.getFullYear()}-${String(dtDeparture.getMonth()+1).padStart(2,'0')}-${String(dtDeparture.getDate()).padStart(2,'0')} ${String(dtDeparture.getHours()).padStart(2,'0')}:${String(dtDeparture.getMinutes()).padStart(2,'0')}:${String(dtDeparture.getSeconds()).padStart(2,'0')}`;

    const dtCreated = new Date(trip.created_at + "Z");
    trip.created_at = `${dtCreated.getFullYear()}-${String(dtCreated.getMonth()+1).padStart(2,'0')}-${String(dtCreated.getDate()).padStart(2,'0')} ${String(dtCreated.getHours()).padStart(2,'0')}:${String(dtCreated.getMinutes()).padStart(2,'0')}:${String(dtCreated.getSeconds()).padStart(2,'0')}`;

    res.json({ success: true, data: trip });
  } catch (err) {
    console.error("View trip error:", err);
    res.status(500).json({ success: false, message: "Failed to view trip" });
  }
};





//ratings

// -------------------------
// GET /api/trips/ratings/list
// -------------------------
export const getRatingsForDriver = async (req, res) => {
  try {
    // Use authenticated driver's ID
    const driverId = Number(req.user?.id);
    if (!driverId) return res.status(401).json({ success: false, message: "Invalid driver ID" });

    const result = await pool.query(
      `SELECT r.id, r.trip_id, r.passenger_id, p.full_name AS passenger, r.rating AS stars, r.review AS comment, r.created_at
       FROM ratings r
       JOIN passengers p ON r.passenger_id = p.id
       WHERE r.driver_id = ?
       ORDER BY r.created_at DESC`,
      [driverId]
    );

    // Normalize rows
    const rows = Array.isArray(result[0]) ? result[0] : result;

    // Serialize BigInt fields to string
    const ratings = rows.map(r => ({
      id: r.id.toString(),
      trip_id: r.trip_id.toString(),
      passenger_id: r.passenger_id.toString(),
      passenger: r.passenger,
      stars: Number(r.stars),
      comment: r.comment,
      created_at: r.created_at ? new Date(r.created_at + "Z").toISOString() : null
    }));

    res.json({ success: true, data: ratings });
  } catch (err) {
    console.error("Get driver ratings error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch ratings" });
  }
};

// -------------------------
// GET /api/trips/ratings/summary
// -------------------------
export const getRatingsSummary = async (req, res) => {
  try {
    const driverId = Number(req.user?.id);
    if (!driverId) return res.status(401).json({ success: false, message: "Invalid driver ID" });

    const result = await pool.query(
      `SELECT rating AS stars, COUNT(*) AS count
       FROM ratings
       WHERE driver_id = ?
       GROUP BY rating`,
      [driverId]
    );

    const rows = Array.isArray(result[0]) ? result[0] : result;

    // Build breakdown
    const breakdown = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    let totalReviews = 0;
    let totalStars = 0;

    rows.forEach(row => {
      const stars = Number(row.stars);   // <-- convert BigInt to Number
      const count = Number(row.count);   // <-- convert BigInt to Number
      breakdown[stars] = count;
      totalReviews += count;
      totalStars += stars * count;
    });

    const average = totalReviews ? +(totalStars / totalReviews).toFixed(2) : 0;

    res.json({ success: true, data: { average, totalReviews, breakdown } });
  } catch (err) {
    console.error("Ratings summary error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch ratings summary" });
  }
};
// -------------------------
// GET /api/trips/ratings/list
// -------------------------
export const getRatingsList = async (req, res) => {
  try {
    const driverId = Number(req.user?.id);
    if (!driverId) return res.status(401).json({ success: false, message: "Invalid driver ID" });

    const result = await pool.query(
      `SELECT r.id, r.trip_id, r.passenger_id, p.full_name AS passenger, r.rating AS stars, r.review AS comment, r.created_at
       FROM ratings r
       JOIN passengers p ON r.passenger_id = p.id
       WHERE r.driver_id = ?
       ORDER BY r.created_at DESC`,
      [driverId]
    );

    const rows = Array.isArray(result[0]) ? result[0] : result;

    // Serialize BigInt fields to string
    const ratings = rows.map(r => ({
      ...r,
      id: r.id.toString(),
      trip_id: r.trip_id.toString(),
      passenger_id: r.passenger_id.toString(),
      created_at: r.created_at ? new Date(r.created_at + "Z").toISOString() : null
    }));

    res.json({ success: true, data: ratings });
  } catch (err) {
    console.error("Get driver ratings error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch ratings" });
  }
};