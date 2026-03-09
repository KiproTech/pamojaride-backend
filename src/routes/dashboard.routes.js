import express from "express";
import { getDashboard, getEarnings } from "../controllers/dashboard.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, getDashboard);
router.get("/earnings", authenticateToken, getEarnings);  // <-- New route

export default router;