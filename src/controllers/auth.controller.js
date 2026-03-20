// src/controllers/auth.controller.js
import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper to convert BigInt to string for JSON
const serializeUser = (user) => {
  if (!user) return null;
  if (typeof user.id === "bigint") user.id = user.id.toString();
  return user;
};

// ================= REGISTER =================
export const register = async (req, res) => {
  const { full_name, email, password, phone } = req.body;

  // ---- Validation ----
  if (!full_name || !email || !password || !phone) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (full_name.trim().split(" ").length < 2) {
    return res.status(400).json({ success: false, message: "Full name must contain at least two words" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address" });
  }

  if (!/^\d{10,12}$/.test(phone)) {
    return res.status(400).json({ success: false, message: "Phone number must be 10–12 digits" });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Check existing email or phone
    const rows = await conn.query(
      "SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1",
      [email, phone]
    );

    if (rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or phone already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await conn.query(
      `INSERT INTO users (full_name, email, password_hash, phone, account_status)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, passwordHash, phone, "unverified"]
    );

    // Fetch inserted user
    const userRows = await conn.query(
      `SELECT id, full_name, email, phone, account_status FROM users WHERE id = ?`,
      [result.insertId]
    );

    const user = serializeUser(userRows[0]);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: "driver" },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" }
    );

    return res.status(201).json({ success: true, user, token });
  } catch (err) {
    console.error("Register error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email or phone already registered",
      });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      `SELECT id, full_name, email, password_hash, phone, profile_picture, account_status
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = rows[0];

    if (!user.password_hash) {
      console.error("Missing password_hash for:", user.email);
      return res.status(500).json({ success: false, message: "Account configuration error" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    delete user.password_hash;
    const safeUser = serializeUser(user);

    const token = jwt.sign(
      { id: safeUser.id, email: safeUser.email, role: "driver" },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" }
    );

    return res.json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};


export const passengerRegister = async (req, res) => {
  const { full_name, email, phone, password } = req.body;

  // ---- Validation ----
  if (!full_name || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (full_name.trim().split(" ").length < 2) {
    return res.status(400).json({
      success: false,
      message: "Full name must contain at least two words",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address",
    });
  }

  const phoneRegex = /^\d{10,12}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be 10–12 digits",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  let conn;

  try {
    conn = await pool.getConnection();

    // ---- Check if email or phone exists ----
    const existingRows = await conn.query(
      `SELECT id FROM passengers WHERE email = ? OR phone = ? LIMIT 1`,
      [email, phone]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or phone already registered",
      });
    }

    // ---- Hash password ----
    const passwordHash = await bcrypt.hash(password, 10);

    // ---- Insert new passenger ----
    await conn.query(
      `INSERT INTO passengers (full_name, email, phone, password_hash)
       VALUES (?, ?, ?, ?)`,
      [full_name, email, phone, passwordHash]
    );

    // ✅ Success response (NO auto-login)
    return res.status(201).json({
      success: true,
      message: "Registration successful. Please log in to continue.",
    });

  } catch (err) {
    console.error("Passenger register error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email or phone already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (conn) conn.release();
  }
};



// ================= PASSENGER LOGIN =================
export const passengerLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  let conn;

  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      `SELECT id, full_name, email, password_hash, phone, profile_picture
       FROM passengers WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passenger = rows[0];

    const match = await bcrypt.compare(password, passenger.password_hash);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    delete passenger.password_hash;

    const safePassenger = serializeUser(passenger);

    const token = jwt.sign(
      { id: safePassenger.id, email: safePassenger.email, role: "passenger" },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      passenger: safePassenger,
      token,
    });

  } catch (err) {
    console.error("Passenger login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};

// ================= VERIFY PASSENGER EMAIL =================
export const verifyPassengerEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  let conn;

  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      `SELECT id FROM passengers WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    return res.json({
      success: true,
      message: "Email verified",
    });

  } catch (err) {
    console.error("Verify email error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (conn) conn.release();
  }
};

// ================= RESET PASSENGER PASSWORD =================
export const resetPassengerPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  let conn;

  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      `SELECT id FROM passengers WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await conn.query(
      `UPDATE passengers SET password_hash = ?, updated_at = NOW() WHERE email = ?`,
      [passwordHash, email]
    );

    return res.json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    if (conn) conn.release();
  }
};
