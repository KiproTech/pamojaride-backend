// src/routes/bookings.routes.js
import express from "express";
import {
  getTripsWithBookings,
  getActiveBookings,
  getCancelledBookings,
  cancelBooking,
  getHistoryTripsWithBookings
} from "../controllers/bookings.controller.js";

import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ==============================
// TRIP NAVIGATOR / HISTORY
// ==============================
// Used by TripHistory page
router.get(
  "/trips/history/with-bookings",
  authenticateToken,
  getHistoryTripsWithBookings
);

// ==============================
// ACTIVE TRIPS
// ==============================

// Get all active trips with bookings
router.get(
  "/trips/with-bookings",
  authenticateToken,
  getTripsWithBookings
);

// Get active bookings for a trip
router.get(
  "/:tripId/active",
  authenticateToken,
  getActiveBookings
);

// Get cancelled bookings for a trip
router.get(
  "/:tripId/cancelled",
  authenticateToken,
  getCancelledBookings
);

// Cancel a booking
router.put(
  "/:bookingId/cancel",
  authenticateToken,
  cancelBooking
);

export default router;