import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    avatar: {
      type: String,
      default: ""
    },
    topic: { 
      type: String 
    },
    members: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }
    ],
    admins: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    isGroup: { 
      type: Boolean, 
      default: true 
    },
    status: { 
      type: String, 
      enum: ["active", "archived"], 
      default: "active" 
    },
    skillOffered: { type: String },
    skillDesired: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
