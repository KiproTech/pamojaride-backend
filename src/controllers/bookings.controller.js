// src/controllers/bookings.controller.js
import { pool } from "../db.js";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import fs from "fs";
import path from "path";

// -------------------------
// Helpers
// -------------------------
const serialize = (obj) => {
  const t = { ...obj };
  for (const key in t) {
    if (typeof t[key] === "bigint") t[key] = t[key].toString();
  } 
  return t;
};

const toLocalDatetime = (utcDatetime) => {
  if (!utcDatetime) return null;
  const dt = new Date(utcDatetime + "Z"); // treat as UTC
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}:${String(dt.getSeconds()).padStart(2,'0')}`;
};

// -------------------------
// GET ALL TRIPS WITH BOOKINGS
// -------------------------
export const getTripsWithBookings = async (req, res) => {
  try {
    const driverId = Number(req.user.id);
    if (!driverId) return res.status(400).json({ success: false, message: "Invalid driver ID" });

    // Fetch trips for driver
    const tripsResult = await pool.query(`SELECT * FROM trips WHERE driver_id=? ORDER BY departure_datetime ASC`, [driverId]);
    const tripsRows = Array.isArray(tripsResult[0]) ? tripsResult[0] : tripsResult;

    const trips = [];

    for (const trip of tripsRows) {
      const t = serialize(trip);
      t.departure_datetime = toLocalDatetime(t.departure_datetime);

      // Auto-update upcoming → ongoing
      if (t.status === "upcoming" && new Date(trip.departure_datetime + "Z") <= new Date()) {
        await pool.query(`UPDATE trips SET status='ongoing' WHERE id=?`, [t.id]);
        t.status = "ongoing";
      }

      // Fetch all bookings for this trip
      const bookingsResult = await pool.query(
        `SELECT b.id, b.seat_number, b.amount AS amount_paid, b.booking_status AS status,
                b.created_at AS booked_at, b.cancelled_at AS cancelled_at,
                p.id AS passenger_id, p.full_name, p.phone
         FROM bookings b
         JOIN passengers p ON b.passenger_id = p.id
         WHERE b.trip_id=? ORDER BY b.seat_number ASC`,
        [t.id]
      );
      const bookingsRows = Array.isArray(bookingsResult[0]) ? bookingsResult[0] : bookingsResult;

      const activeBookings = [];
      const cancelledBookings = [];

      for (const b of bookingsRows) {
        const booking = {
          id: serialize(b).id,
          seat_number: b.seat_number,
          amount_paid: b.amount_paid,
          status: b.status,
          booked_at: toLocalDatetime(b.booked_at),
          cancelled_at: toLocalDatetime(b.cancelled_at),
          passenger: {
            id: serialize(b).passenger_id,
            name: b.full_name,
            phone: b.phone,
          },
        };
        if (b.status === "active") activeBookings.push(booking);
        else if (b.status === "cancelled") cancelledBookings.push(booking);
      }

      trips.push({
        ...t,
        active_bookings: activeBookings,
        cancelled_bookings: cancelledBookings,
      });
    }

    res.json({ success: true, data: trips });
  } catch (err) {
    console.error("getTripsWithBookings error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch trips with bookings" });
  }
};

// -------------------------
// GET ACTIVE BOOKINGS FOR TRIP
// -------------------------
// src/controllers/bookings.controller.js

// -------------------------
// Helpers
// -------------------------


// -------------------------
// GET ACTIVE BOOKINGS FOR A TRIP
// -------------------------
export const getActiveBookings = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);
    if (!tripId) return res.status(400).json({ success: false, message: "Invalid trip ID" });

    // Fetch active bookings with passenger info
    const result = await pool.query(
      `SELECT b.id AS booking_id, b.seat_number, b.amount AS amount_paid, b.booking_status AS status,
       b.created_at AS booked_at,
       p.id AS passenger_id, p.full_name, p.phone
FROM bookings b
JOIN passengers p ON b.passenger_id = p.id
JOIN trips t ON b.trip_id = t.id
WHERE b.trip_id = ?
  AND ((t.status IN ('upcoming','ongoing') AND b.booking_status='active')
       OR (t.status='completed' AND b.booking_status='completed'))
ORDER BY b.seat_number ASC;`,
      [tripId]
    );

    const rows = Array.isArray(result[0]) ? result[0] : result;

    const bookings = rows.map((b) => {
      const booking = serialize(b);
      return {
        id: booking.booking_id,
        seat_number: booking.seat_number,
        amount_paid: booking.amount_paid,
        status: booking.status,
        booked_at: toLocalDatetime(booking.booked_at),
        passenger: {
          id: booking.passenger_id,
          name: booking.full_name,
          phone: booking.phone,
        },
      };
    });

    res.json({ success: true, data: bookings });
  } catch (err) {
    console.error("getActiveBookings error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch active bookings" });
  }
};
// -------------------------
// GET CANCELLED BOOKINGS FOR TRIP
// -------------------------
// -------------------------
// GET CANCELLED BOOKINGS FOR A TRIP
// -------------------------
export const getCancelledBookings = async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);

    if (!tripId) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    const result = await pool.query(
      `SELECT
        b.id AS booking_id,
        b.seat_number,
        b.amount AS amount_paid,
        b.booking_status AS status,
        b.created_at AS booked_at,
        b.cancelled_at,
        b.cancelled_by,
        p.id AS passenger_id,
        p.full_name,
        p.phone
      FROM bookings b
      JOIN passengers p ON p.id = b.passenger_id
      WHERE b.trip_id = ?
      AND b.booking_status = 'cancelled'
      ORDER BY b.seat_number ASC`,
      [tripId]
    );

    const rows = Array.isArray(result[0]) ? result[0] : result;

    const bookings = rows.map((b) => {
      const booking = serialize(b);

      return {
        id: booking.booking_id,
        seat_number: booking.seat_number,
        amount_paid: booking.amount_paid,
        status: booking.status,
        booked_at: toLocalDatetime(booking.booked_at),
        cancelled_at: booking.cancelled_at
          ? toLocalDatetime(booking.cancelled_at)
          : null,
        cancelled_by: booking.cancelled_by || "Unknown",
        passenger: {
          id: booking.passenger_id,
          name: booking.full_name,
          phone: booking.phone,
        },
      };
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    console.error("getCancelledBookings error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cancelled bookings",
    });
  }
};
// -------------------------
//// -------------------------
// CANCEL BOOKING
// -------------------------
// -------------------------
// DRIVER CANCEL BOOKING
// -------------------------
export const cancelBooking = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const bookingId = Number(req.params.bookingId);
    const driverId = Number(req.user.id);

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      });
    }

    await conn.beginTransaction();

    // 1️⃣ Cancel the booking (only if active & belongs to driver)
    const result = await conn.query(
      `
      UPDATE bookings b
      JOIN trips t ON t.id = b.trip_id
      SET 
        b.booking_status = 'cancelled',
        b.cancelled_by = 'driver',
        b.cancelled_at = NOW()
      WHERE 
        b.id = ?
        AND b.booking_status = 'active'
        AND t.driver_id = ?
      `,
      [bookingId, driverId]
    );

    const affectedRows =
      Array.isArray(result) && result[0]?.affectedRows !== undefined
        ? result[0].affectedRows
        : result.affectedRows;

    if (!affectedRows || affectedRows === 0) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: "Booking not found, already cancelled, or not authorized"
      });
    }

    // 2️⃣ Restore the seat for this trip
    await conn.query(
      `
      UPDATE trips t
      JOIN bookings b ON b.trip_id = t.id
      SET t.seats_available = t.seats_available + 1
      WHERE b.id = ?
      `,
      [bookingId]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Booking cancelled and seat restored successfully"
    });

  } catch (err) {
    await conn.rollback();
    console.error("cancelBooking error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking"
    });
  } finally {
    conn.release();
  }
};


export const getTripHistory = async (req, res) => {
  try {
    const driverId = Number(req.user.id);

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "Invalid driver ID"
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        th.id AS trip_id,
        th.start_location,
        th.end_location,
        th.departure_datetime,

        b.id AS booking_id,
        b.seat_number,
        b.amount AS amount_paid,
        b.booking_status,
        b.created_at AS booked_at,

        p.full_name,
        p.phone

      FROM trip_history th
      LEFT JOIN bookings b
        ON b.trip_history_id = th.id
      LEFT JOIN passengers p
        ON p.id = b.passenger_id

      WHERE th.driver_id = ?
      ORDER BY th.departure_datetime DESC, b.seat_number ASC
      `,
      [driverId]
    );

    const tripsMap = {};

    for (const row of rows) {
      if (!tripsMap[row.trip_id]) {
        tripsMap[row.trip_id] = {
          id: row.trip_id,
          route: `${row.start_location} → ${row.end_location}`,
          departure: toLocalDatetime(row.departure_datetime),
          totalCollected: 0,
          passengers: []
        };
      }

      if (row.booking_id) {
        tripsMap[row.trip_id].passengers.push({
          id: row.booking_id,
          name: row.full_name,
          seat: row.seat_number,
          contact: row.phone,
          bookedAt: toLocalDatetime(row.booked_at),
          amountPaid: row.amount_paid,
          status:
            row.booking_status === "cancelled"
              ? "Cancelled"
              : "Active"
        });

        if (row.booking_status === "active") {
          tripsMap[row.trip_id].totalCollected += Number(row.amount_paid);
        }
      }
    }

    return res.json({
      success: true,
      data: Object.values(tripsMap)
    });

  } catch (err) {
    console.error("getTripHistory error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trip history"
    });
  }
};


// GET TRIPHISTORY



//get TRip HiSTORY WITH BOOKINGS

// src/controllers/bookings.controller.js



export const getHistoryTripsWithBookings = async (req, res) => {
  try {
    const driverId = Number(req.user.id);
    if (!driverId) {
      return res.status(400).json({ success: false, message: "Invalid driver ID" });
    }

    // Use pool.query (or pool.execute) and ensure destructuring
    const result = await pool.query(
      `
      SELECT
        th.id AS trip_id,
        th.start_location,
        th.end_location,
        th.departure_datetime,
        th.price_per_seat,
        th.seats_available,
        th.status,
        th.created_at,
        th.archived_at,
        th.total_collected,
        b.id AS booking_id,
        b.seat_number,
        b.amount AS amount_paid,
        b.booking_status,
        b.created_at AS booked_at,
        b.cancelled_at,
        p.id AS passenger_id,
        p.full_name,
        p.phone
      FROM trip_history th
      LEFT JOIN bookings b ON b.trip_history_id = th.id
      LEFT JOIN passengers p ON p.id = b.passenger_id
      WHERE th.driver_id = ?
      ORDER BY th.departure_datetime DESC, b.booking_status ASC, b.seat_number ASC
      `,
      [driverId]
    );

    // Sometimes result is [rows, fields], sometimes just rows
    const rows = Array.isArray(result[0]) ? result[0] : result;

    if (!Array.isArray(rows)) {
      console.error("Query did not return an array:", rows);
      return res.status(500).json({ success: false, message: "Invalid query result" });
    }

    const tripsMap = {};

    for (const row of rows) {
      const tripId = Number(row.trip_id);

      if (!tripsMap[tripId]) {
        tripsMap[tripId] = {
          id: tripId,
          route: `${row.start_location} → ${row.end_location}`,
          departure: toLocalDatetime(row.departure_datetime),
          archivedAt: row.archived_at ? toLocalDatetime(row.archived_at) : null,
          totalCollected: 0,
          passengers: [],
        };
      }

      if (row.booking_id) {
        const amountPaid = Number(row.amount_paid || 0);

        tripsMap[tripId].passengers.push({
          id: Number(row.booking_id),
          name: row.full_name,
          seat: row.seat_number,
          contact: row.phone,
          bookedAt: toLocalDatetime(row.booked_at),
          cancelledAt: row.cancelled_at ? toLocalDatetime(row.cancelled_at) : null,
          amountPaid,
          status: row.booking_status === "cancelled" ? "Cancelled" : "Active",
        });

        if (row.booking_status === "active") {
          tripsMap[tripId].totalCollected += amountPaid;
        }
      }
    }

    // Sort passengers: active first, then cancelled
    for (const trip of Object.values(tripsMap)) {
      trip.passengers.sort((a, b) => {
        if (a.status === b.status) return a.seat - b.seat;
        return a.status === "Active" ? -1 : 1;
      });
    }

    return res.json({ success: true, data: Object.values(tripsMap) });
  } catch (error) {
    console.error("getHistoryTripsWithBookings error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch historical trips" });
  }
};

//INSERT INTO TRIP HISTORY

export const archiveTripById = async (tripId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Insert into trip_history
    const [insertResult] = await connection.query(
      `
      INSERT INTO trip_history (
        driver_id,
        start_location,
        end_location,
        departure_datetime,
        price_per_seat,
        seats_available,
        status,
        created_at
      )
      SELECT
        driver_id,
        start_location,
        end_location,
        departure_datetime,
        price_per_seat,
        seats_available,
        status,
        created_at
      FROM trips
      WHERE id = ?
      `,
      [tripId]
    );

    const historyId = insertResult.insertId;

    // 2️⃣ Move bookings
    await connection.query(
      `
      UPDATE bookings
      SET
        trip_history_id = ?,
        trip_id = NULL
      WHERE trip_id = ?
      `,
      [historyId, tripId]
    );

    // 3️⃣ Delete trip
    await connection.query(
      `DELETE FROM trips WHERE id = ?`,
      [tripId]
    );

    await connection.commit();

    return { success: true };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};