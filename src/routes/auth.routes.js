// src/routes/auth.routes.js
import express from "express";
import { login, register } from "../controllers/auth.controller.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/register
router.post("/register", register);

export default router;