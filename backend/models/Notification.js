import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["incoming_call", "call_accepted", "call_rejected", "call_scheduled", "call_reminder", "missed_call", "new_match", "new_message"],
      required: true
    },
    relatedCall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Call"
    },
    message: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
