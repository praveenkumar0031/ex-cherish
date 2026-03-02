import mongoose from "mongoose";
const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Enforce unique names platform-wide
  skillOffered: { type: String, required: true }, 
  skillDesired: { type: String, required: true }, 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Limited to 2 for 1-on-1
  status: { type: String, enum: ['active', 'completed'], default: 'active' }, 
  createdAt: { type: Date, default: Date.now },
});

// Create a compound index so a user cannot create two rooms for the same skill
roomSchema.index({ createdBy: 1, skillOffered: 1 }, { unique: true });

export default mongoose.model("Room", roomSchema);