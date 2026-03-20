// src/controllers/users.controller.js
import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

// Helper to convert BigInt to string for JSON
const serialize = (data) => {
  if (data === undefined || data === null) return null;

  return JSON.parse(
    JSON.stringify(data, (_, value) => (typeof value === "bigint" ? value.toString() : value))
  );
};

// -------- GET ALL USERS --------
export const getAllUsers = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM users");
    res.json({ success: true, data: serialize(rows) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (conn) conn.release();
  }
};

// -------- GET USER BY ID --------
export const getUserById = async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM users WHERE id = ?", [id]);
    if (!rows || rows.length === 0)
      return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: serialize(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (conn) conn.release();
  }
};

// -------- REGISTER USER --------
export const registerUser = async (req, res) => {
  const { full_name, email, password, phone } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const [existing] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing && existing.length > 0)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    await conn.query(
      "INSERT INTO users (full_name, email, password_hash, phone, account_status) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, passwordHash, phone || "", "unverified"]
    );

    res.status(201).json({ success: true, message: "Account created successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};

// -------- FORGOT PASSWORD --------
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT id, full_name FROM users WHERE email = ?", [email]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: "Email not found" });

    const user = rows[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour expiry

    await conn.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      [resetToken, expires, user.id]
    );

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.your-email.com",
      port: 587,
      auth: { user: "your-email@example.com", pass: "your-email-password" },
    });

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: '"PamojaRide" <no-reply@pamojaride.com>',
      to: email,
      subject: "Password Reset Request",
      html: `<p>Hello ${user.full_name},</p>
             <p>Click the link below to reset your password (valid for 1 hour):</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ success: true, message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};

// -------- RESET PASSWORD --------
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res.status(400).json({ success: false, message: "Token and new password are required" });
  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT id, reset_token_expiry FROM users WHERE reset_token = ?", [token]);
    if (!rows || rows.length === 0)
      return res.status(400).json({ success: false, message: "Invalid or expired token" });

    const user = rows[0];
    if (!user.reset_token_expiry || new Date(user.reset_token_expiry) < new Date())
      return res.status(400).json({ success: false, message: "Token has expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await conn.query(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};


//settings

// -------------------------
// GET /api/users/settings
// -------------------------
export const getUserSettings = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!userId) return res.status(401).json({ success: false, message: "Invalid user ID" });

    const result = await pool.query(
      `SELECT 
          u.id AS user_id,
          u.full_name,
          u.email,
          u.phone,
          u.address,
          u.profile_picture,
          u.id_number,
          u.account_status,

          v.id AS vehicle_id,
          v.vehicle_type,
          v.plate_number,
          v.status AS vehicle_status,
          v.logbook_file,
          v.insurance_file,
          v.created_at AS vehicle_created_at,

          dv.id AS verification_id,
          dv.id_document,
          dv.selfie_with_id,
          dv.license_document,
          dv.status AS verification_status,
          dv.submitted_at AS verification_submitted,
          dv.reviewed_at AS verification_reviewed,

          p.show_phone,
          p.show_email,
          p.receive_notifications,
          p.hide_trips,
          p.private_mode,

          a.id AS session_id,
          a.device_info,
          a.ip_address,
          a.last_active
       FROM users u
       LEFT JOIN vehicles v ON v.driver_id = u.id
       LEFT JOIN driver_verifications dv ON dv.driver_id = u.id
       LEFT JOIN preferences p ON p.user_id = u.id
       LEFT JOIN active_sessions a ON a.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    const rows = Array.isArray(result[0]) ? result[0] : result;
    if (!rows || rows.length === 0) return res.json({ success: true, data: null });

    const row = rows[0];

    // Safely serialize the main row
    const settings = serialize({
      user: {
        id: row.user_id,
        full_name: row.full_name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        profile_picture: row.profile_picture,
        id_number: row.id_number,
        account_status: row.account_status,
      },
      vehicle: row.vehicle_id
        ? {
            id: row.vehicle_id,
            type: row.vehicle_type,
            plate_number: row.plate_number,
            status: row.vehicle_status,
            logbook_file: row.logbook_file,
            insurance_file: row.insurance_file,
            created_at: row.vehicle_created_at,
          }
        : null,
      verification: row.verification_id
        ? {
            id: row.verification_id,
            id_document: row.id_document,
            selfie_with_id: row.selfie_with_id,
            license_document: row.license_document,
            status: row.verification_status,
            submitted_at: row.verification_submitted,
            reviewed_at: row.verification_reviewed,
          }
        : null,
      preferences: row.show_phone !== undefined
        ? {
            show_phone: Boolean(row.show_phone),
            show_email: Boolean(row.show_email),
            receive_notifications: Boolean(row.receive_notifications),
            hide_trips: Boolean(row.hide_trips),
            private_mode: Boolean(row.private_mode),
          }
        : null,
      session: row.session_id
        ? {
            id: row.session_id,
            device_info: row.device_info,
            ip_address: row.ip_address,
            last_active: row.last_active,
          }
        : null,
    });

    res.json({ success: true, data: settings });
  } catch (err) {
    console.error("Settings error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user settings" });
  }
};



//Passenger


// ---------------- PASSENGER ----------------
// src/controllers/users.controller.js

const toLocalDatetime = (datetime) => {
  if (!datetime) return null;
  // Convert MariaDB DATETIME to ISO format for JS
  const dt = new Date(datetime.replace(" ", "T"));
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}:${String(dt.getSeconds()).padStart(2,'0')}`;
};

// ---------- GET PASSENGER PROFILE ----------
export const getPassengerProfile = async (req, res) => {
  try {
    const passengerId = Number(req.user.id);
    if (!passengerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT 
         id,
         full_name,
         email,
         phone,
         profile_picture,
         date_of_birth,
         gender,
         status AS account_status,
         created_at,
         updated_at
       FROM passengers
       WHERE id = ?`,
      [passengerId]
    );

    const rows = Array.isArray(result[0]) ? result[0] : result;

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Passenger not found" });
    }

    const passenger = serialize(rows[0]);

    // Optionally convert timestamps
    passenger.created_at = toLocalDatetime(passenger.created_at);
    passenger.updated_at = toLocalDatetime(passenger.updated_at);

    return res.json({ success: true, data: passenger });

  } catch (error) {
    console.error("Passenger profile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// ---------- UPDATE PASSENGER PROFILE ----------

export const updatePassengerProfile = async (req, res) => {
  let conn;
  try {
    const passengerId = Number(req.user.id);
    if (!passengerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { full_name, email, phone } = req.body;

    conn = await pool.getConnection();

    // 1️⃣ Check if email exists for another passenger
    const emailCheck = await conn.query(
      "SELECT id FROM passengers WHERE email = ? AND id != ? LIMIT 1",
      [email, passengerId]
    );

    if (emailCheck && emailCheck.length > 0) {
      return res.status(400).json({ success: false, message: "Email already in use by another account" });
    }

    // 2️⃣ Update passenger profile
    const result = await conn.query(
      `UPDATE passengers
       SET full_name = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [full_name, email, phone, passengerId]
    );

    if (!result || result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: "Profile update failed" });
    }

    // 3️⃣ Fetch updated profile
    const [rows] = await conn.query(
      "SELECT id, full_name, email, phone, created_at, updated_at FROM passengers WHERE id = ?",
      [passengerId]
    );

    const profile = rows[0];
    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: profile.id.toString(),
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        created_at: profile.created_at ? toLocalDatetime(profile.created_at) : null,
        updated_at: profile.updated_at ? toLocalDatetime(profile.updated_at) : null
      }
    });

  } catch (err) {
    console.error("updatePassengerProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating profile" });
  } finally {
    if (conn) conn.release();
  }
};


// ---------- CHANGE PASSENGER PASSWORD ----------

export const changePassengerPassword = async (req, res) => {
  let conn;
  try {
    const passengerId = Number(req.user.id);
    if (!passengerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res.status(400).json({ success: false, message: "Old and new passwords are required" });
    }

    conn = await pool.getConnection();

    // 1️⃣ Fetch current hashed password
    const result = await conn.query(
      "SELECT password_hash FROM passengers WHERE id = ?",
      [passengerId]
    );

    // Normalize result for MariaDB/MySQL2
    const rows = Array.isArray(result[0]) ? result[0] : result;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Passenger not found" });
    }

    const hashedPassword = rows[0].password_hash;

    // 2️⃣ Verify old password
    const isMatch = await bcrypt.compare(old_password, hashedPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect" });
    }

    // 3️⃣ Hash new password
    const newHashed = await bcrypt.hash(new_password, 10);

    // 4️⃣ Update password
    await conn.query(
      "UPDATE passengers SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newHashed, passengerId]
    );

    return res.json({ success: true, message: "Password updated successfully" });

  } catch (err) {
    console.error("changePassengerPassword error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating password" });
  } finally {
    if (conn) conn.release();
  }
};


// update profile

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads/profile_pictures";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.id}${ext}`);
  }
});

export const upload = multer({ storage });

// -------------------------
// PATCH /api/passenger/profile-picture
// -------------------------
// export const updateProfilePicture = async (req, res) => {
//   let conn;
//   try {
//     const passengerId = Number(req.user.id);
//     if (!passengerId) return res.status(401).json({ success: false, message: "Unauthorized" });
//     if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

//     const filePath = `/uploads/profile_pictures/${req.file.filename}`;

//     conn = await pool.getConnection();
//     await conn.query(
//       "UPDATE passengers SET profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
//       [filePath, passengerId]
//     );

//     return res.json({ success: true, message: "Profile picture updated", profile_picture: filePath });
//   } catch (err) {
//     console.error("updateProfilePicture error:", err);
//     return res.status(500).json({ success: false, message: "Server error while updating profile picture" });
//   } finally {
//     if (conn) conn.release();
//   }
// };


//update driver profile
export const updateProfilePicture = async (file) => {
  if (!file) throw new Error("No file provided");

  const token = getToken();
  const formData = new FormData();
  formData.append("profile_picture", file);

  const res = await fetch(`${BASE_URL}/users/profile-picture`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      // Content-Type is NOT set, let browser handle FormData
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    notify(data.message || "Image upload failed", "error");
    throw new Error(data.message || "Image upload failed");
  }

  // ✅ Update localStorage passenger object
  const passenger = JSON.parse(localStorage.getItem("passenger")) || {};
  passenger.profile_picture = data.profile_picture;
  localStorage.setItem("passenger", JSON.stringify(passenger));

  notify("Profile picture updated!");
  return data;
};
