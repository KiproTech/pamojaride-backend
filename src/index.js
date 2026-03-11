// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

import usersRoutes from "./routes/users.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import tripRoutes from "./routes/trip.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------
// MIDDLEWARE
// -------------------
// -------------------
// CORS MIDDLEWARE
// -------------------
const allowedOrigins = [
  "http://localhost:5173", // local Vite frontend
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://pamojaride-driver.vercel.app", // ✅ add your Vercel frontend
];
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.includes("vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// handle preflight
app.options("*", cors());

// JSON parser
app.use(express.json());

// -------------------
// ROUTES
// -------------------
app.get("/", (req, res) => res.send("🚀 Pamojaride Backend Running on localhost:5000!"));

// DB test
app.get("/test-db", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT 1 AS test");
    const safeRows = JSON.parse(JSON.stringify(rows, (_, v) => typeof v === "bigint" ? v.toString() : v));
    res.json({ success: true, data: safeRows });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (conn) conn.release();
  }
});
// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/bookings", bookingsRoutes);

// Catch-all 404
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global error handler
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