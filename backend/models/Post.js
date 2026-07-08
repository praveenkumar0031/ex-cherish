import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["question", "article", "note", "tutorial", "code-snippet", "resource"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    content: {
      type: String,
      required: true,
      maxlength: [50000, "Content cannot exceed 50000 characters"],
    },
    summary: {
      type: String,
      maxlength: 500,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      index: true,
      default: "General",
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 10,
        message: "Maximum 10 tags allowed",
      },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
      index: true,
    },
    // Counters (denormalized for performance)
    views: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },

    // For questions
    isAnswered: { type: Boolean, default: false },
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // For code snippets
    codeLanguage: { type: String, default: "" },

    // For resource links
    resourceUrl: { type: String, default: "" },

    isReported: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Full-text search index
postSchema.index(
  { title: "text", content: "text", tags: "text", summary: "text" },
  { weights: { title: 10, tags: 5, summary: 3, content: 1 } }
);

// Compound indexes for common queries
postSchema.index({ status: 1, type: 1, createdAt: -1 });
postSchema.index({ author: 1, status: 1, createdAt: -1 });
postSchema.index({ tags: 1, status: 1, createdAt: -1 });
postSchema.index({ category: 1, status: 1, createdAt: -1 });

export default mongoose.model("Post", postSchema);
