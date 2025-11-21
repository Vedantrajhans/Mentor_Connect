import express from "express";
import {
  completeMentorProfile,
  searchMentors,
  getMentorProfile,
  getMyMentorProfile,
  updateMentorProfile,
  updateAvailability,
} from "../controllers/mentorController.js";
import { authorize, protect } from "../middlewares/auth.js";

const mentorRoutes = express.Router();

// Public routes
mentorRoutes.get("/search", searchMentors);
mentorRoutes.get("/:id", getMentorProfile);

// Protected mentor routes
mentorRoutes.post(
  "/profile",
  protect,
  authorize("mentor"),
  completeMentorProfile
);
mentorRoutes.get(
  "/profile/me",
  protect,
  authorize("mentor"),
  getMyMentorProfile
);
mentorRoutes.put("/profile", protect, authorize("mentor"), updateMentorProfile);
mentorRoutes.put(
  "/availability",
  protect,
  authorize("mentor"),
  updateAvailability
);

export default mentorRoutes;
