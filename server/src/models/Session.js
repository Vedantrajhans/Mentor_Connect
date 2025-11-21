import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    topic: { type: String, required: true },
    zoomLink: { type: String },
    zoomMeetingId: { type: String },
    zoomPassword: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rejected"],
      default: "pending", // Changed from 'scheduled' to 'pending'
    },
    rejectionReason: { type: String },
    reviewedByMentee: { type: Boolean, default: false },
    reviewedByMentor: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
