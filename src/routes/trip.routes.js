// src/routes/trip.routes.js
import express from "express";
import {
  getTrips,
  createTrip,
  startTrip,
  completeTrip,
  cancelTrip,
  viewTrip,
  getRatingsSummary,
  getRatingsForDriver,
  getAvailableTrips,
  bookTrip,
  getPassengerNotifications,

  // ✅ Passenger dashboard
  getPassengerTrips,
  getUpcomingTrips,
  getDashboardStats,

  // ✅ Passenger actions
  cancelBooking,
  completeBooking,
  markNotificationsAsRead
} from "../controllers/trip.controller.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// ---------------- DRIVER ROUTES ----------------
router.get("/", authenticate("driver"), getTrips);
router.post("/", authenticate("driver"), createTrip);
router.patch("/:id/start", authenticate("driver"), startTrip);
router.patch("/:id/complete", authenticate("driver"), completeTrip);
router.patch("/:id/cancel", authenticate("driver"), cancelTrip);
router.get("/:id/view", authenticate("driver"), viewTrip);

// ---------------- RATINGS ----------------
router.get("/ratings/summary", authenticate("driver"), getRatingsSummary);
router.get("/ratings/list", authenticate("driver"), getRatingsForDriver);

// ---------------- PASSENGER ROUTES ----------------

// 🔹 Available trips
router.get("/available", authenticate("passenger"), getAvailableTrips);

// 🔹 Book trip
router.post("/book", authenticate("passenger"), bookTrip);

// 🔹 Current (ONGOING trip)
router.get("/current", authenticate("passenger"), getPassengerTrips);

// 🔹 Upcoming booked trips
router.get("/upcoming", authenticate("passenger"), getUpcomingTrips);

// 🔹 Dashboard stats (cards)
router.get("/stats", authenticate("passenger"), getDashboardStats);

// 🔹 Cancel booking
router.patch("/booking/:bookingId/cancel", authenticate("passenger"), cancelBooking);

// 🔹 Complete trip
router.patch("/booking/:bookingId/complete", authenticate("passenger"), completeBooking);

// 🔹 Notifications
router.get("/notifications", authenticate("passenger"), getPassengerNotifications);
router.patch("/notifications/read", authenticate("passenger"), markNotificationsAsRead);

export default router;