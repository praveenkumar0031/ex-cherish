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
      enum: [
        // Call types
        "incoming_call", "call_accepted", "call_rejected", "call_scheduled", "call_reminder", "missed_call",
        // Social types
        "new_match", "new_message",
        // Knowledge sharing types
        "post_like", "post_comment", "comment_reply", "post_mention"
      ],
      required: true
    },
    relatedCall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Call"
    },
    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    },
    message: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
