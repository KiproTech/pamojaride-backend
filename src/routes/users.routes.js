// src/routes/users.routes.js
import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  registerUser,
  forgotPassword,
  resetPassword,
  getUserSettings,
} from "../controllers/users.controller.js";

import { authenticate } from "../middleware/auth.js";

const router = Router();

// -------------------
// USER ROUTES
// -------------------

// Get logged-in user's full settings
router.get("/settings", authenticate, getUserSettings);

// Get all users
router.get("/", getAllUsers);

// Get user by ID
router.get("/:id", getUserById);

// Register a new user
router.post("/signup", registerUser);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

export default router;