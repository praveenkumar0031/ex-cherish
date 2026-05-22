import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  meetingId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  hostId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["active", "ended"], 
    default: "active" 
  }
}, { timestamps: true });

export default mongoose.model("Meeting", meetingSchema);
