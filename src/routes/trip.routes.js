import express from "express";
import {
  getTrips,
  createTrip,
  startTrip,
  completeTrip,
  cancelTrip,
  viewTrip,
  getRatingsSummary,
  getRatingsForDriver, // used for /ratings/list
} from "../controllers/trip.controller.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// ---------------- TRIPS ----------------
router.get("/", getTrips);
router.post("/", createTrip);
router.patch("/:id/start", startTrip);
router.patch("/:id/complete", completeTrip);
router.patch("/:id/cancel", cancelTrip);
router.get("/:id/view", viewTrip);

// ---------------- RATINGS ----------------
// Ratings summary for authenticated driver
router.get("/ratings/summary", getRatingsSummary);

// Ratings list for authenticated driver
router.get("/ratings/list", getRatingsForDriver);

export default router;