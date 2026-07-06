import mongoose from "mongoose";

// BUG FIX: Was using CommonJS (require/module.exports) in an ESM project ("type":"module")
// BUG FIX: Field was named 'content' but messageService.js writes 'text' — fixed to 'text'
// BUG FIX: Removed 24h TTL (expires: 86400) — was silently deleting all messages after 24 hours
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for efficient private message queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ room: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);