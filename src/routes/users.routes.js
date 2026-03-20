// routes/users.routes.js
import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  registerUser,
  forgotPassword,
  resetPassword,
  getUserSettings,
  getPassengerProfile,
  updatePassengerProfile,
  changePassengerPassword,
  upload, 
  updateProfilePicture,
  // updateDriverProfilePicture, // <-- new
} from "../controllers/users.controller.js";

import { authenticate } from "../middleware/auth.js";

const router = Router();

// -------------------
// AUTHENTICATED ROUTES
// -------------------
router.get("/settings", authenticate, getUserSettings);

router.get(
  "/passenger/profile",
  authenticate("passenger"),
  getPassengerProfile
);

// -------------------
// PUBLIC ROUTES
// -------------------
router.post("/signup", registerUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// -------------------
// USER FETCH ROUTES
// -------------------
router.get("/", getAllUsers);
router.get("/:id", getUserById);

router.put("/profile", authenticate("passenger"), updatePassengerProfile);
router.put("/change-password", authenticate("passenger"), changePassengerPassword);

// -------------------
// PROFILE PICTURE UPLOAD
// -------------------

// Passenger
router.patch(
  "/profile-picture",
  authenticate("passenger"),          // passenger auth
  upload.single("profile_picture"),
  updateProfilePicture
);

// // Driver
// router.patch(
//   "/driver/profile-picture",
//   authenticate("driver"),            // driver auth
//   upload.single("profile_picture"),  // multer middleware
//   updateDriverProfilePicture         // driver controller
// );

export default router;
