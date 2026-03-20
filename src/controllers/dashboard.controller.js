// src/controllers/dashboard.controller.js
import { pool } from "../db.js";

// ---------- helpers ----------
const serialize = (obj) => {
  const t = { ...obj };
  for (const k in t) {
    if (typeof t[k] === "bigint") t[k] = t[k].toString();
  }
  return t;
};

const toLocalDatetime = (utc) => {
  const d = new Date(utc + "Z");
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}
          ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
};

// ---------- controller ----------
export const getDashboard = async (req, res) => {
  try {
    const driverId = Number(req.user.id);
    const now = new Date();

    // 1️⃣ fetch trips
    const result = await pool.query(
      `SELECT * FROM trips WHERE driver_id = ?`,
      [driverId]
    );
    const rows = Array.isArray(result[0]) ? result[0] : result;

    let completed = 0;
    let upcoming = 0;
    let ongoingTrips = [];

    for (let trip of rows) {
      const t = serialize(trip);

      // auto-update upcoming → ongoing
      if (t.status === "upcoming" && new Date(t.departure_datetime + "Z") <= now) {
        await pool.query(`UPDATE trips SET status='ongoing' WHERE id=?`, [t.id]);
        t.status = "ongoing";
      }

      if (t.status === "completed") completed++;
      if (t.status === "upcoming") upcoming++;
      if (t.status === "ongoing") {
        t.departure_datetime = toLocalDatetime(t.departure_datetime);
        ongoingTrips.push(t);
      }
    }

    // 2️⃣ notifications
    const notifResult = await pool.query(
      `SELECT id, title, message, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [driverId]
    );
    const notifications = (Array.isArray(notifResult[0]) ? notifResult[0] : notifResult)
      .map(serialize);

    // 3️⃣ earnings today (like Earnings dashboard)
    const earnRows = await pool.query(
      `SELECT IFNULL(
          SUM(CASE 
            WHEN DATE(departure_datetime) = CURDATE() 
            THEN total_collected ELSE 0 END), 0
        ) AS earnings_today
       FROM (
         SELECT driver_id, departure_datetime, total_collected, status
         FROM trips
         UNION ALL
         SELECT driver_id, departure_datetime, total_collected, status
         FROM trip_history
       ) AS all_trips
       WHERE driver_id = ?
         AND status = 'completed'`,
      [driverId]
    );

    const earningsTodayRaw = Array.isArray(earnRows[0]) ? earnRows[0][0] : earnRows[0];
    const earningsToday = Number(earningsTodayRaw?.earnings_today || 0);

    // 4️⃣ response
    res.json({
      success: true,
      data: {
        completed_trips: completed,
        upcoming_trips: upcoming,
        ongoing_trips: ongoingTrips,
        notifications,
        earnings_today: earningsToday
      }
    });

  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ success: false, message: "Failed to load dashboard" });
  }
};


//Earinings

export const getEarnings = async (req, res) => {
  try {
    const driverId = Number(req.user.id);

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "Invalid driver ID"
      });
    }

    const tripsUnion = `
      SELECT id, driver_id, start_location, end_location, departure_datetime, total_collected, status
      FROM trips
      UNION ALL
      SELECT id, driver_id, start_location, end_location, departure_datetime, total_collected, status
      FROM trip_history
    `;

    // 1️⃣ Earnings Summary
    const summaryRows = await pool.query(
      `
      SELECT
        SUM(CASE
            WHEN DATE(departure_datetime) = CURDATE()
            THEN total_collected ELSE 0 END) AS today,

        SUM(CASE
            WHEN YEARWEEK(departure_datetime,1) = YEARWEEK(CURDATE(),1)
            THEN total_collected ELSE 0 END) AS week,

        SUM(CASE
            WHEN MONTH(departure_datetime) = MONTH(CURDATE())
            AND YEAR(departure_datetime) = YEAR(CURDATE())
            THEN total_collected ELSE 0 END) AS month,

        SUM(total_collected) AS total
      FROM (${tripsUnion}) AS all_trips
      WHERE driver_id = ?
      AND status = 'completed'
      `,
      [driverId]
    );

    const summaryRaw = summaryRows[0] || {
      today: 0,
      week: 0,
      month: 0,
      total: 0
    };

    const summary = {
      today: Number(summaryRaw.today || 0),
      week: Number(summaryRaw.week || 0),
      month: Number(summaryRaw.month || 0),
      total: Number(summaryRaw.total || 0)
    };

    // 2️⃣ Trips + Passengers
    const tripRows = await pool.query(
      `
      SELECT
        at.id AS trip_id,
        at.start_location,
        at.end_location,
        at.departure_datetime,
        b.id AS booking_id,
        b.seat_number,
        b.amount AS amount_paid,
        b.booking_status,
        p.full_name,
        p.phone
      FROM (${tripsUnion}) at
      LEFT JOIN bookings b ON b.trip_id = at.id
      LEFT JOIN passengers p ON p.id = b.passenger_id
      WHERE at.driver_id = ?
      AND at.status = 'completed'
      ORDER BY at.departure_datetime DESC, b.seat_number ASC
      `,
      [driverId]
    );

    const tripsMap = {};

    for (const row of tripRows) {
      const t = serialize(row);
      const tripId = t.trip_id;

      if (!tripsMap[tripId]) {
        tripsMap[tripId] = {
          id: tripId,
          start: t.start_location,
          destination: t.end_location,
          date: toLocalDatetime(t.departure_datetime),
          passengers: 0,
          amount: 0,
          paymentStatus: "Paid",
          passengerDetails: []
        };
      }

      if (t.booking_id) {
        tripsMap[tripId].passengerDetails.push({
          name: t.full_name,
          seat: t.seat_number,
          paid: Number(t.amount_paid)
        });

        tripsMap[tripId].passengers += 1;
        tripsMap[tripId].amount += Number(t.amount_paid);
      }
    }

    const trips = Object.values(tripsMap);

    res.json({
      success: true,
      summary,
      trips
    });

  } catch (err) {
    console.error("getEarnings error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch earnings"
    });
  }
};


//