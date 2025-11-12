import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Room", roomSchema);
