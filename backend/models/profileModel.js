import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dob: { type: String },
    mobile: { type: String },
    interestedAreas: { type: [String], index: true }, // Index for matchmaking intersection queries
    credit: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
