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


//Get Available bookings

export const getAvailableTrips = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      `SELECT 
         t.id AS trip_id,
         t.driver_id,
         u.full_name AS driver_name,
         u.phone AS driver_phone,
         t.start_location,
         t.end_location,
         t.departure_datetime,
         t.seats_available,
         t.price_per_seat AS amount_per_seat,
         t.status
       FROM trips t
       JOIN users u ON t.driver_id = u.id
       WHERE t.status = 'upcoming'
       ORDER BY t.departure_datetime ASC`
    );

    // Convert BigInt to string for JSON serialization
    const trips = rows.map(trip => ({
      ...trip,
      trip_id: trip.trip_id.toString(),
      driver_id: trip.driver_id.toString(),
    }));

    return res.json({ success: true, trips });
  } catch (err) {
    console.error("Get trips error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};

// ================= PASSENGER: BOOK A TRIP ================

/// ---------------- BOOK TRIP ----------------
export const bookTrip = async (req, res) => {
  const { trip_id, seat_count, payment_method } = req.body;
  const passenger_id = req.user.id; // from token

  if (!trip_id || !seat_count) {
    return res.status(400).json({ success: false, message: "trip_id and seat_count are required" });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // 1️⃣ Check if passenger already booked this trip
    const existing = await conn.query(
  `SELECT id FROM bookings 
   WHERE trip_id = ? 
   AND passenger_id = ? 
   AND booking_status = 'active' 
   LIMIT 1`,
  [trip_id, passenger_id]
);

    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: "You have already booked this trip" });
    }

    // 2️⃣ Fetch trip
    const trips = await conn.query(
      "SELECT id, driver_id, seats_available, price_per_seat, status, start_location, end_location FROM trips WHERE id = ? LIMIT 1",
      [trip_id]
    );

    if (!trips || trips.length === 0) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const trip = trips[0];

    if (trip.status !== "upcoming") {
      return res.status(400).json({ success: false, message: "Cannot book a trip that is not upcoming" });
    }

    if (trip.seats_available < seat_count) {
      return res.status(400).json({ success: false, message: "Not enough seats available" });
    }

    // 3️⃣ Assign random seat numbers
    const assignedSeats = [];
    const startSeat = 1;
    const endSeat = trip.seats_available;
    while (assignedSeats.length < seat_count) {
      const seat = Math.floor(Math.random() * endSeat) + startSeat;
      if (!assignedSeats.includes(seat)) assignedSeats.push(seat);
    }

    // 4️⃣ Insert booking
    const amount = trip.price_per_seat * seat_count;
    const result = await conn.query(
      `INSERT INTO bookings (trip_id, passenger_id, seat_number, amount, payment_method, booking_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [trip_id, passenger_id, assignedSeats.join(","), amount, payment_method || "mpesa", "active"]
    );

    // 5️⃣ Update seats_available
    let updatedSeats = trip.seats_available - seat_count;
    if (updatedSeats < 0) updatedSeats = 0;
    await conn.query(
      "UPDATE trips SET seats_available = ? WHERE id = ?",
      [updatedSeats, trip_id]
    );

    // 6️⃣ Insert notifications
    // Passenger notification
    await conn.query(
      `INSERT INTO notifications 
        (user_id, title, message, type, is_read, passenger_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [null, "Trip Booked", `Your trip from ${trip.start_location} → ${trip.end_location} has been booked.`, "alert", 1, passenger_id]
    );

    // Driver notification
    await conn.query(
      `INSERT INTO notifications 
        (user_id, title, message, type, is_read, passenger_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [trip.driver_id, "New Booking", `Passenger has booked a trip from ${trip.start_location} → ${trip.end_location}.`, "alert", 0, null]
    );

    // ✅ Prepare response
    const bookingResponse = {
      booking_id: result.insertId.toString(),
      trip_id: trip_id.toString(),
      passenger_id: passenger_id.toString(),
      seats_booked: assignedSeats,
      amount,
      remaining_seats: updatedSeats
    };

    return res.status(201).json({
      success: true,
      message: "Trip booked successfully",
      booking: bookingResponse
    });

  } catch (err) {
    console.error("Booking error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};
// src/controllers/trip.controller.js
// ---------- GET PASSENGER NOTIFICATIONS ----------
export const getPassengerNotifications = async (req, res) => {
  try {
    const passengerId = Number(req.user.id);
    if (!passengerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch last 5 notifications for the passenger
   const result = await pool.query(
  `SELECT 
      id,
      title,
      message,
      link,
      type,
      is_read,
      created_at,
      updated_at
   FROM notifications
   WHERE passenger_id = ? 
     AND user_id IS NULL
   ORDER BY created_at DESC
   LIMIT 15`,
  [passengerId]
);

    const rows = Array.isArray(result[0]) ? result[0] : result;

    if (!rows.length) {
      return res.json({ success: true, data: [] });
    }

    const notifications = rows.map((n) => ({
      id: n.id.toString(),             // Convert BigInt to string
      title: n.title,
      message: n.message,
      link: n.link,
      type: n.type,
      is_read: Boolean(n.is_read),
      created_at: toLocalDatetime(n.created_at),
      updated_at: toLocalDatetime(n.updated_at),
    }));

    return res.json({ success: true, data: notifications });
  } catch (err) {
    console.error("getPassengerNotifications error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};
// src/controllers/passenger.controller.js

// -------------------------
// GET ongoing booked trip
// -------------------------
export const getPassengerTrips = async (req, res) => {
  try {
    const passengerId = Number(req.user.id);

    if (!passengerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT 
         b.id AS booking_id,
         t.id AS trip_id,
         t.start_location,
         t.end_location,
         t.departure_datetime,
         t.price_per_seat,
         t.seats_available,
         b.seat_number,
         b.amount,
         b.booking_status,
         u.full_name AS driver_name,
         u.phone AS driver_phone,
         v.plate_number AS vehicle_plate,

         -- Count booked seats
         (
           SELECT COUNT(*) 
           FROM bookings 
           WHERE trip_id = t.id
         ) AS booked_seats

       FROM bookings b
       JOIN trips t ON b.trip_id = t.id
       JOIN users u ON t.driver_id = u.id
       LEFT JOIN vehicles v ON v.driver_id = t.driver_id
       WHERE b.passenger_id = ?
       AND t.status = 'ongoing'
       ORDER BY t.departure_datetime ASC`,
      [passengerId]
    );

    const rows = Array.isArray(result[0]) ? result[0] : result;

    if (!rows.length) {
      return res.json({ success: true, data: null });
    }

    const trip = rows[0];

    const currentTrip = {
      booking_id: trip.booking_id.toString(),
      trip_id: trip.trip_id.toString(),
      start_location: trip.start_location,
      end_location: trip.end_location,
      departure_datetime: toLocalDatetime(trip.departure_datetime),
      price_per_seat: Number(trip.price_per_seat || 0),
      seat_number: trip.seat_number,
      amount: Number(trip.amount || 0),
      booking_status: trip.booking_status,
      driver_name: trip.driver_name || "N/A",
      driver_phone: trip.driver_phone || "N/A",
      vehicle_plate: trip.vehicle_plate || "N/A",
      booked_seats: Number(trip.booked_seats || 0),
      seats_available: Number(trip.seats_available || 0),
      trip_status:
        Number(trip.seats_available) === 0 ? "Fully booked" : "Available",
    };

    return res.json({ success: true, data: currentTrip });

  } catch (err) {
    console.error("getPassengerTrips error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch current trip",
    });
  }
};
// -------------------------
// GET upcoming booked trips
export const getUpcomingTrips = async (req, res) => {
  try {
    const passengerId = Number(req.user.id);

    if (!passengerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT 
         b.id AS booking_id,
         t.id AS trip_id,
         t.start_location,
         t.end_location,
         t.departure_datetime,
         t.price_per_seat,
         t.seats_available,
         b.seat_number,
         b.amount,
         b.booking_status,
         u.full_name AS driver_name,
         u.phone AS driver_phone,
         v.plate_number AS vehicle_plate,

         -- Count booked seats
         (
           SELECT COUNT(*) 
           FROM bookings 
           WHERE trip_id = t.id
         ) AS booked_seats

       FROM bookings b
       JOIN trips t ON b.trip_id = t.id
       JOIN users u ON t.driver_id = u.id
       LEFT JOIN vehicles v ON v.driver_id = t.driver_id
       WHERE b.passenger_id = ?
       AND t.status = 'upcoming'
       ORDER BY t.departure_datetime ASC`,
      [passengerId]
    );

    const rows = Array.isArray(result[0]) ? result[0] : result;

    if (!rows.length) {
      return res.json({ success: true, data: [] });
    }

    const upcomingTrips = rows.map(trip => ({
      booking_id: trip.booking_id.toString(),
      trip_id: trip.trip_id.toString(),
      start_location: trip.start_location,
      end_location: trip.end_location,
      departure_datetime: toLocalDatetime(trip.departure_datetime),
      price_per_seat: Number(trip.price_per_seat || 0),
      seat_number: trip.seat_number,
      amount: Number(trip.amount || 0),
      booking_status: trip.booking_status,
      driver_name: trip.driver_name || "N/A",
      driver_phone: trip.driver_phone || "N/A",
      vehicle_plate: trip.vehicle_plate || "N/A",
      booked_seats: Number(trip.booked_seats || 0),
      seats_available: Number(trip.seats_available || 0),
      trip_status:
        Number(trip.seats_available) === 0 ? "Fully booked" : "Available",
    }));

    return res.json({ success: true, data: upcomingTrips });

  } catch (err) {
    console.error("getUpcomingTrips error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming trips",
    });
  }
};
// -------------------------
// -------------------------
// GET dashboard stats
// -------------------------
export const getDashboardStats = async (req, res) => {
  const passengerId = Number(req.user.id);

  try {
    // 1️⃣ Trips this month
    const tripsResult = await pool.query(
      `SELECT COUNT(*) AS trips_this_month
       FROM bookings b
       JOIN trips t ON b.trip_id = t.id
       WHERE b.passenger_id = ?
         AND b.booking_status = 'completed'
         AND MONTH(t.departure_datetime) = MONTH(CURRENT_DATE())
         AND YEAR(t.departure_datetime) = YEAR(CURRENT_DATE())`,
      [passengerId]
    );

    const tripsRow = Array.isArray(tripsResult[0]) ? tripsResult[0][0] : tripsResult[0];
    const tripsThisMonth = tripsRow ? Number(tripsRow.trips_this_month) : 0;

    // 2️⃣ Total spend
    const spendResult = await pool.query(
      `SELECT SUM(b.amount) AS total_spend
       FROM bookings b
       WHERE b.passenger_id = ? 
         AND b.booking_status = 'completed'`,
      [passengerId]
    );

    const spendRow = Array.isArray(spendResult[0]) ? spendResult[0][0] : spendResult[0];
    const totalSpend = spendRow && spendRow.total_spend ? Number(spendRow.total_spend) : 0;

    // 3️⃣ Unread notifications
    const notifResult = await pool.query(
      `SELECT COUNT(*) AS unread_notifications
       FROM notifications
       WHERE passenger_id = ?
       AND user_id IS NULL
         AND is_read = 0`,
      [passengerId]
    );

    const notifRow = Array.isArray(notifResult[0]) ? notifResult[0][0] : notifResult[0];
    const unreadNotifications = notifRow ? Number(notifRow.unread_notifications) : 0;

    res.json({
      success: true,
      data: {
        tripsThisMonth,
        totalSpend,
        notifications: unreadNotifications
      }
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};
// -------------------------
// PATCH cancel booking
// -------------------------
export const cancelBooking = async (req, res) => {
  const passengerId = Number(req.user.id);
  const { bookingId } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Fetch booking with trip info safely
    const result = await conn.query(
      `SELECT 
          b.id AS booking_id,
          b.seat_number,
          b.amount,
          b.booking_status,
          t.id AS trip_id,
          t.start_location,
          t.end_location,
          t.status AS trip_status,
          t.driver_id
       FROM bookings b
       JOIN trips t ON b.trip_id = t.id
       WHERE b.id = ? AND b.passenger_id = ?`,
      [bookingId, passengerId]
    );

    // Normalize result depending on MariaDB vs mysql2
    const rows = Array.isArray(result[0]) ? result[0] : result;
    const booking = rows[0];

    if (!booking) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Only allow cancellation for active & upcoming trips
    if (booking.booking_status !== "active" || booking.trip_status !== "upcoming") {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: "Only active upcoming trips can be cancelled",
      });
    }

    // Update booking status to cancelled
    await conn.query(
      `UPDATE bookings
       SET booking_status='cancelled', cancelled_by='passenger', cancelled_at=NOW()
       WHERE id=?`,
      [bookingId]
    );

    // Release the seat
    await conn.query(
      `UPDATE trips
       SET seats_available = seats_available + 1
       WHERE id=?`,
      [booking.trip_id]
    );

    // Insert notification for passenger
    const passengerMsg = `Your trip from ${booking.start_location} to ${booking.end_location} has been cancelled.`;
    await conn.query(
      `INSERT INTO notifications (passenger_id, user_id, title, message, type, is_read)
       VALUES (?, ?, 'Trip Cancelled', ?, 'alert', 0)`,
      [passengerId, null, passengerMsg]
    );

    // Insert notification for driver
    if (booking.driver_id) {
      const driverMsg = `Passenger has cancelled their trip from ${booking.start_location} to ${booking.end_location}.`;
      await conn.query(
        `INSERT INTO notifications (user_id, passenger_id, title, message, type, is_read)
         VALUES (?, ?, 'Trip Cancelled', ?, 'alert', 0)`,
        [booking.driver_id, passengerId, driverMsg]
      );
    }

    await conn.commit();
    return res.json({ success: true, message: "Booking cancelled and seat released" });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error("cancelBooking error:", err);
    return res.status(500).json({ success: false, message: "Failed to cancel booking" });
  } finally {
    if (conn) conn.release();
  }
};
// -------------------------
// PATCH complete booking
// -------------------------
export const completeBooking = async (req, res) => {
  const passengerId = Number(req.user.id);
  const { bookingId } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [[booking]] = await conn.query(
      `SELECT b.*, t.id AS trip_id, t.start_location, t.end_location, t.status
       FROM bookings b
       JOIN trips t ON b.trip_id = t.id
       WHERE b.id = ? AND b.passenger_id = ?`,
      [bookingId, passengerId]
    );

    if (!booking) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "ongoing") {
      await conn.rollback();
      return res.status(400).json({ success: false, message: "Only ongoing trips can be completed" });
    }

    await conn.query(
      `UPDATE bookings SET booking_status='completed' WHERE id=?`,
      [bookingId]
    );

    await conn.query(
      `UPDATE trips SET status='completed' WHERE id=?`,
      [booking.trip_id]
    );

    await conn.query(
      `INSERT INTO notifications (passenger_id, title, message, type, is_read)
       VALUES (?, 'Trip Completed', ?, 'success', 0)`,
      [passengerId, `Your trip from ${booking.start_location} to ${booking.end_location} is completed`]
    );

    await conn.commit();
    res.json({ success: true, message: "Trip marked as completed" });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error("completeBooking error:", err);
    res.status(500).json({ success: false, message: "Failed to complete booking" });
  } finally {
    if (conn) conn.release();
  }
}

// controllers/notifications.controller.js
export const markNotificationsAsRead = async (req, res) => {
  const passengerId = Number(req.user.id);

  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = 1
       WHERE passenger_id = ?
         AND user_id IS NULL
         AND is_read = 0`,
      [passengerId]
    );

    return res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error("markNotificationsAsRead error:", err);
    return res.status(500).json({ success: false, message: "Failed to mark notifications as read" });
  }
};