// src/routes/auth.routes.js
import express from "express";
import {
login,
register,
passengerLogin,
passengerRegister,verifyPassengerEmail,resetPassengerPassword
} from "../controllers/auth.controller.js";

const router = express.Router();

// DRIVER AUTH
// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/register
router.post("/register", register);

// PASSENGER AUTH
// POST /api/auth/passenger/login
router.post("/passenger/login", passengerLogin);

// POST /api/auth/passenger/register
router.post("/passenger/register", passengerRegister);
router.post("/passenger/verify-email", verifyPassengerEmail);
router.post("/passenger/reset-password", resetPassengerPassword);

export default router;
