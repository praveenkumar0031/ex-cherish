import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }], // Both matched users
  status: { type: String, enum: ["pending", "matched"], default: "pending", index: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // IDs of users who clicked 'like'
}, { timestamps: true });

export default mongoose.model("Match", matchSchema);
