import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Keep this, but maybe auto-generate it
  skillOffered: { type: String }, // e.g., "React"
  skillDesired: { type: String }, // e.g., "Python"
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ['pending', 'active', 'completed'], default: 'active' }, 
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Room", roomSchema);
