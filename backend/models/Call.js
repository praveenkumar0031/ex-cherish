import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    callType: {
      type: String,
      enum: ["instant", "scheduled"],
      default: "instant"
    },
    roomId: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ["pending", "ringing", "accepted", "active", "rejected", "missed", "completed", "ended", "scheduled"],
      default: "pending",
      index: true
    },
    scheduledFor: { type: Date, index: true },
    startedAt: { type: Date },
    endedAt: { type: Date },
    duration: { type: Number, default: 0 } // in seconds
  },
  { timestamps: true }
);

export default mongoose.model("Call", callSchema);
