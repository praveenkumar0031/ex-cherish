import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dob: { type: String },
    mobile: { type: String },
    interestedAreas: { type: [String], index: true }, 
    bio: { type: String, maxLength: 500 },
    tags: { type: [String], index: true },
    categories: { type: [String], index: true },
    credit: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
