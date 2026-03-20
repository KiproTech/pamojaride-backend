// src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";

/**
 * Auth middleware
 * Verifies JWT and attaches user info to req.user
 * Supports driver and passenger roles
 */
export const authenticate = (role = "driver") => {
  return (req, res, next) => {
    // Use mock mode if NODE_ENV is test
    if (process.env.NODE_ENV === "test") {
      return mockAuth(req, res, next, role);
    }

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

      if (decoded.role !== role) {
        return res.status(403).json({
          success: false,
          message: `Access forbidden: requires ${role} role.`,
        });
      }

      // Attach user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
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
};

// ---------------------------
// Mock auth for local/dev/testing
// ---------------------------
export const mockAuth = (req, res, next, role = "driver") => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // For testing, the token is a base64-encoded JSON string
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));

    if (decoded.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden: requires ${role} role.`,
      });
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    console.error("Mock auth error:", err);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ---------------------------
// Backwards compatibility export
// ---------------------------
export const authenticateToken = authenticate();