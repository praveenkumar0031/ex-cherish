import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // each user has only one profile
    },
    dob: { type: String },
    mobile: { type: String },
    interestedAreas: { type: [String] },
  },
  { timestamps: true }
);


export default mongoose.model("Profile", profileSchema);
