import mongoose from "mongoose";

// Unified like model — works for both Posts and Comments
const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
  },
  { timestamps: true }
);

// Prevent duplicate likes and enable fast lookup
likeSchema.index({ user: 1, target: 1, targetType: 1 }, { unique: true });
likeSchema.index({ target: 1, targetType: 1 });

export default mongoose.model("Like", likeSchema);
