import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      trim: true 
    },
    topic: { 
      type: String // Useful for your "Skill Exchange" or "Interest" topics
    },
    members: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }
    ],
    isGroup: { 
      type: Boolean, 
      default: true // true for public topics, false for 1-on-1 matches
    },
    status: { 
      type: String, 
      enum: ["active", "archived"], 
      default: "active" 
    },
    // For Skill Exchange specific features
    skillOffered: { type: String },
    skillDesired: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);