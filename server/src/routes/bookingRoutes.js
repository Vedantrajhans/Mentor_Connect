import express from "express";
import {
  bookSession,
  getUserSessions,
  completeSession,
  confirmSession,
  rejectSession,
  cancelSession,
} from "../controllers/bookingController.js";
import { authorize, protect } from "../middlewares/auth.js";

const bookingRoutes = express.Router();

bookingRoutes.use(protect);
bookingRoutes.post("/", authorize("mentee"), bookSession);
bookingRoutes.get("/my", getUserSessions);
bookingRoutes.post("/:sessionId/complete", completeSession);

// Mentor-only routes
bookingRoutes.post("/:sessionId/confirm", authorize("mentor"), confirmSession);
bookingRoutes.post("/:sessionId/reject", authorize("mentor"), rejectSession);

// Cancel route (both mentor and mentee)
bookingRoutes.delete("/:sessionId/cancel", cancelSession);

export default bookingRoutes;
