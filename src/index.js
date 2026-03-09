import express from "express";
import cors from "cors";
import { pool } from "./db.js";

import usersRoutes from "./routes/users.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------
// MIDDLEWARE
// -------------------
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.startsWith("http://localhost") || origin.includes(".ngrok-free.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

// Parse JSON request bodies
app.use(express.json());

// -------------------
// ROUTES
// -------------------

// Health check
app.get("/", (req, res) => res.send("Pamojaride Backend Running!"));

// Optional DB test
app.get("/test-db", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT 1 AS test");
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// -------------------
// API ROUTES
// -------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/bookings", bookingsRoutes);

// Catch-all 404 for undefined API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ success: false, message: err.message || "Server error" });
});

// -------------------
// START SERVER
// -------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});