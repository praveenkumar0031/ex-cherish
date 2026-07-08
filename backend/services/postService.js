import Post from "../models/Post.js";
import Like from "../models/Like.js";
import Bookmark from "../models/Bookmark.js";
import * as notificationService from "./notificationService.js";

// ─── Helper ─────────────────────────────────────────────────────────────────
// Auto-generate summary from content (strip markdown, take first 200 chars)
const generateSummary = (content) => {
  return content
    .replace(/```[\s\S]*?```/g, "")  // remove code blocks
    .replace(/`[^`]+`/g, "")         // remove inline code
    .replace(/[#*_~>\[\]]/g, "")     // remove markdown symbols
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 220);
};

// ─── Create Post ─────────────────────────────────────────────────────────────
export const createPost = async (authorId, data) => {
  const { type, title, content, category, tags, status, codeLanguage, resourceUrl } = data;

  if (!type || !title?.trim() || !content?.trim()) {
    const err = new Error("Type, title, and content are required");
    err.statusCode = 400;
    throw err;
  }

  const cleanTags = (tags || [])
    .map((t) => t.toLowerCase().trim().replace(/\s+/g, "-"))
    .filter(Boolean)
    .slice(0, 10);

  const post = await Post.create({
    author: authorId,
    type,
    title: title.trim(),
    content: content.trim(),
    summary: generateSummary(content),
    category: category?.trim() || "General",
    tags: cleanTags,
    status: status || "published",
    codeLanguage: codeLanguage || "",
    resourceUrl: resourceUrl || "",
  });

  return await post.populate("author", "name username profilePic role isVerified");
};

// ─── Get Paginated Posts (Feed) ────────────────────────────────────────────
export const getPosts = async ({ page = 1, limit = 10, type, category, tag, search, sort = "newest", userId } = {}) => {
  const query = { status: "published", isDeleted: { $ne: true } };

  if (type && type !== "all") query.type = type;
  if (category) query.category = category;
  if (tag) query.tags = tag;

  // Full-text search
  if (search?.trim()) {
    query.$text = { $search: search.trim() };
  }

  // Sort options
  const sortMap = {
    newest: { createdAt: -1 },
    popular: { likesCount: -1, commentsCount: -1, createdAt: -1 },
    trending: { views: -1, likesCount: -1, createdAt: -1 },
    oldest: { createdAt: 1 },
  };
  const sortOption = sortMap[sort] || sortMap.newest;

  const skip = (Number(page) - 1) * Number(limit);

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate("author", "name username profilePic role isVerified")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Post.countDocuments(query),
  ]);

  // If caller is logged in, attach liked/bookmarked flags
  let likedSet = new Set();
  let bookmarkedSet = new Set();

  if (userId) {
    const postIds = posts.map((p) => p._id);
    const [likes, bookmarks] = await Promise.all([
      Like.find({ user: userId, target: { $in: postIds }, targetType: "Post" }).lean(),
      Bookmark.find({ user: userId, post: { $in: postIds } }).lean(),
    ]);
    likedSet = new Set(likes.map((l) => l.target.toString()));
    bookmarkedSet = new Set(bookmarks.map((b) => b.post.toString()));
  }

  const enriched = posts.map((p) => ({
    ...p,
    isLiked: likedSet.has(p._id.toString()),
    isBookmarked: bookmarkedSet.has(p._id.toString()),
  }));

  return {
    posts: enriched,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    hasMore: skip + posts.length < total,
  };
};

// ─── Get Single Post ──────────────────────────────────────────────────────
export const getPostById = async (postId, userId = null) => {
  const post = await Post.findOne({ _id: postId, isDeleted: { $ne: true } })
    .populate("author", "name username profilePic role isVerified")
    .populate("acceptedAnswer")
    .lean();

  if (!post) {
    const err = new Error("Post not found");
    err.statusCode = 404;
    throw err;
  }

  // Increment views (fire and forget)
  Post.findByIdAndUpdate(postId, { $inc: { views: 1 } }).exec();

  let isLiked = false;
  let isBookmarked = false;

  if (userId) {
    const [like, bookmark] = await Promise.all([
      Like.findOne({ user: userId, target: postId, targetType: "Post" }).lean(),
      Bookmark.findOne({ user: userId, post: postId }).lean(),
    ]);
    isLiked = !!like;
    isBookmarked = !!bookmark;
  }

  return { ...post, isLiked, isBookmarked };
};

// ─── Get User Posts ───────────────────────────────────────────────────────
export const getUserPosts = async (profileUserId, requestingUserId, { page = 1, limit = 10, status } = {}) => {
  const query = {
    author: profileUserId,
    isDeleted: { $ne: true },
  };

  // Only show drafts to the post owner
  if (status && profileUserId.toString() === requestingUserId?.toString()) {
    query.status = status;
  } else {
    query.status = "published";
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate("author", "name username profilePic role isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Post.countDocuments(query),
  ]);

  return {
    posts,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    hasMore: skip + posts.length < total,
  };
};

// ─── Update Post ──────────────────────────────────────────────────────────
export const updatePost = async (postId, authorId, data) => {
  const post = await Post.findOne({ _id: postId, isDeleted: { $ne: true } });
  if (!post) {
    const err = new Error("Post not found");
    err.statusCode = 404;
    throw err;
  }
  if (post.author.toString() !== authorId.toString()) {
    const err = new Error("You can only edit your own posts");
    err.statusCode = 403;
    throw err;
  }

  const { title, content, category, tags, status, codeLanguage, resourceUrl } = data;

  if (title) post.title = title.trim();
  if (content) {
    post.content = content.trim();
    post.summary = generateSummary(content);
  }
  if (category) post.category = category.trim();
  if (tags) {
    post.tags = tags
      .map((t) => t.toLowerCase().trim().replace(/\s+/g, "-"))
      .filter(Boolean)
      .slice(0, 10);
  }
  if (status) post.status = status;
  if (codeLanguage !== undefined) post.codeLanguage = codeLanguage;
  if (resourceUrl !== undefined) post.resourceUrl = resourceUrl;

  await post.save();
  return await post.populate("author", "name username profilePic role isVerified");
};

// ─── Delete Post ──────────────────────────────────────────────────────────
export const deletePost = async (postId, userId, userRole) => {
  const post = await Post.findById(postId);
  if (!post) {
    const err = new Error("Post not found");
    err.statusCode = 404;
    throw err;
  }

  const isOwner = post.author.toString() === userId.toString();
  const isAdmin = userRole === "admin" || userRole === "moderator";

  if (!isOwner && !isAdmin) {
    const err = new Error("Not authorized to delete this post");
    err.statusCode = 403;
    throw err;
  }

  post.isDeleted = true;
  await post.save();
  return { message: "Post deleted successfully" };
};

// ─── Toggle Like ──────────────────────────────────────────────────────────
export const toggleLike = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) {
    const err = new Error("Post not found");
    err.statusCode = 404;
    throw err;
  }

  const existingLike = await Like.findOne({ user: userId, target: postId, targetType: "Post" });

  if (existingLike) {
    // Unlike
    await existingLike.deleteOne();
    post.likesCount = Math.max(0, post.likesCount - 1);
    await post.save();
    return { liked: false, likesCount: post.likesCount };
  } else {
    // Like
    await Like.create({ user: userId, target: postId, targetType: "Post" });
    post.likesCount += 1;
    await post.save();

    // Notify post author (skip if liking own post)
    if (post.author.toString() !== userId.toString()) {
      await notificationService.createNotification({
        recipientId: post.author,
        senderId: userId,
        type: "post_like",
        message: `liked your post: "${post.title.slice(0, 60)}${post.title.length > 60 ? "..." : ""}"`,
        relatedPost: postId,
      }).catch(() => {}); // Non-critical — don't fail the like
    }

    return { liked: true, likesCount: post.likesCount };
  }
};

// ─── Toggle Bookmark ─────────────────────────────────────────────────────
export const toggleBookmark = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) {
    const err = new Error("Post not found");
    err.statusCode = 404;
    throw err;
  }

  const existing = await Bookmark.findOne({ user: userId, post: postId });

  if (existing) {
    await existing.deleteOne();
    post.bookmarksCount = Math.max(0, post.bookmarksCount - 1);
    await post.save();
    return { bookmarked: false, bookmarksCount: post.bookmarksCount };
  } else {
    await Bookmark.create({ user: userId, post: postId });
    post.bookmarksCount += 1;
    await post.save();
    return { bookmarked: true, bookmarksCount: post.bookmarksCount };
  }
};

// ─── Get Bookmarked Posts ─────────────────────────────────────────────────
export const getBookmarkedPosts = async (userId, { page = 1, limit = 10 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);

  const [bookmarks, total] = await Promise.all([
    Bookmark.find({ user: userId })
      .populate({
        path: "post",
        match: { isDeleted: { $ne: true }, status: "published" },
        populate: { path: "author", select: "name username profilePic role isVerified" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Bookmark.countDocuments({ user: userId }),
  ]);

  const posts = bookmarks.map((b) => b.post).filter(Boolean);
  return {
    posts,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    hasMore: skip + posts.length < total,
  };
};

// ─── Get Popular Tags ─────────────────────────────────────────────────────
export const getPopularTags = async (limit = 20) => {
  const tags = await Post.aggregate([
    { $match: { status: "published", isDeleted: { $ne: true } } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: Number(limit) },
  ]);
  return tags.map((t) => ({ tag: t._id, count: t.count }));
};
