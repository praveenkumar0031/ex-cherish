import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [5000, "Comment cannot exceed 5000 characters"],
    },
    // null = top-level comment, otherwise it's a reply
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },

    // For question posts — marks the accepted answer
    isAccepted: { type: Boolean, default: false },

    // Soft delete preserves thread structure
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Efficient comment thread fetching
commentSchema.index({ post: 1, parentComment: 1, createdAt: 1 });

export default mongoose.model("Comment", commentSchema);
