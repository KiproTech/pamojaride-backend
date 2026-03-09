// src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";

/**
 * Auth middleware
 * If process.env.NODE_ENV === "test" → uses mockAuth
 * Otherwise → uses JWT verification
 */
export const authenticate = (req, res, next) => {
  // Use mock mode if NODE_ENV is test
  if (process.env.NODE_ENV === "test") {
    return mockAuth(req, res, next);
  }

  // Production JWT verification
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || "driver", // default to driver
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// ---------------------------
// Mock auth for local/dev/testing
// ---------------------------
export const mockAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // For testing, the token is a base64-encoded JSON string
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));

    req.user = { id: decoded.id, role: decoded.role || "driver" };
    next();
  } catch (err) {
    console.error("Mock auth error:", err);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ---------------------------
// Backwards compatibility export
// ---------------------------
export const authenticateToken = authenticate;