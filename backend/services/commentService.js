import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Like from "../models/Like.js";
import * as notificationService from "./notificationService.js";

// ─── Create Comment / Reply ───────────────────────────────────────────────
export const createComment = async (authorId, data) => {
  const { postId, content, parentCommentId } = data;

  if (!content?.trim()) {
    const err = new Error("Comment content is required");
    err.statusCode = 400;
    throw err;
  }

  const post = await Post.findOne({ _id: postId, isDeleted: { $ne: true } });
  if (!post) {
    const err = new Error("Post not found");
    err.statusCode = 404;
    throw err;
  }

  const commentData = {
    post: postId,
    author: authorId,
    content: content.trim(),
    parentComment: parentCommentId || null,
  };

  const comment = await Comment.create(commentData);
  const populated = await comment.populate("author", "name username profilePic role isVerified");

  // Increment post comment count
  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

  // If it's a reply, increment parent reply count
  if (parentCommentId) {
    await Comment.findByIdAndUpdate(parentCommentId, { $inc: { repliesCount: 1 } });

    // Notify the parent comment author (if different user)
    const parentComment = await Comment.findById(parentCommentId).lean();
    if (parentComment && parentComment.author.toString() !== authorId.toString()) {
      await notificationService.createNotification({
        recipientId: parentComment.author,
        senderId: authorId,
        type: "comment_reply",
        message: "replied to your comment.",
        relatedPost: postId,
      }).catch(() => {});
    }
  } else {
    // Top-level comment — notify post author (if different user)
    if (post.author.toString() !== authorId.toString()) {
      await notificationService.createNotification({
        recipientId: post.author,
        senderId: authorId,
        type: "post_comment",
        message: `commented on your post: "${post.title.slice(0, 60)}${post.title.length > 60 ? "..." : ""}"`,
        relatedPost: postId,
      }).catch(() => {});
    }
  }

  return populated;
};

// ─── Get Comments for Post (with replies nested) ─────────────────────────
export const getCommentsByPost = async (postId, userId = null, { page = 1, limit = 20 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);

  // Fetch top-level comments only
  const [topLevelComments, total] = await Promise.all([
    Comment.find({ post: postId, parentComment: null, isDeleted: { $ne: true } })
      .populate("author", "name username profilePic role isVerified")
      .sort({ isAccepted: -1, createdAt: 1 }) // accepted answer first
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Comment.countDocuments({ post: postId, parentComment: null, isDeleted: { $ne: true } }),
  ]);

  if (topLevelComments.length === 0) {
    return { comments: [], total: 0, page: Number(page), pages: 0, hasMore: false };
  }

  // Fetch replies for all top-level comments in one query
  const parentIds = topLevelComments.map((c) => c._id);
  const replies = await Comment.find({
    post: postId,
    parentComment: { $in: parentIds },
    isDeleted: { $ne: true },
  })
    .populate("author", "name username profilePic role isVerified")
    .sort({ createdAt: 1 })
    .lean();

  // Build liked set for the requesting user
  let likedSet = new Set();
  if (userId) {
    const allIds = [...topLevelComments.map((c) => c._id), ...replies.map((r) => r._id)];
    const likes = await Like.find({ user: userId, target: { $in: allIds }, targetType: "Comment" }).lean();
    likedSet = new Set(likes.map((l) => l.target.toString()));
  }

  // Group replies by parent
  const replyMap = {};
  replies.forEach((r) => {
    const pid = r.parentComment.toString();
    if (!replyMap[pid]) replyMap[pid] = [];
    replyMap[pid].push({ ...r, isLiked: likedSet.has(r._id.toString()) });
  });

  // Attach replies to top-level comments
  const comments = topLevelComments.map((c) => ({
    ...c,
    isLiked: likedSet.has(c._id.toString()),
    replies: replyMap[c._id.toString()] || [],
  }));

  return {
    comments,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    hasMore: skip + topLevelComments.length < total,
  };
};

// ─── Update Comment ───────────────────────────────────────────────────────
export const updateComment = async (commentId, authorId, content) => {
  if (!content?.trim()) {
    const err = new Error("Content is required");
    err.statusCode = 400;
    throw err;
  }

  const comment = await Comment.findOne({ _id: commentId, isDeleted: { $ne: true } });
  if (!comment) {
    const err = new Error("Comment not found");
    err.statusCode = 404;
    throw err;
  }
  if (comment.author.toString() !== authorId.toString()) {
    const err = new Error("You can only edit your own comments");
    err.statusCode = 403;
    throw err;
  }

  comment.content = content.trim();
  await comment.save();
  return await comment.populate("author", "name username profilePic role isVerified");
};

// ─── Delete Comment (soft) ────────────────────────────────────────────────
export const deleteComment = async (commentId, userId, userRole) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const err = new Error("Comment not found");
    err.statusCode = 404;
    throw err;
  }

  const isOwner = comment.author.toString() === userId.toString();
  const isMod = userRole === "admin" || userRole === "moderator";

  if (!isOwner && !isMod) {
    const err = new Error("Not authorized to delete this comment");
    err.statusCode = 403;
    throw err;
  }

  comment.isDeleted = true;
  comment.content = "[Comment deleted]";
  await comment.save();

  // Decrement post comment counter
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

  return { message: "Comment deleted" };
};

// ─── Toggle Comment Like ──────────────────────────────────────────────────
export const toggleCommentLike = async (commentId, userId) => {
  const comment = await Comment.findOne({ _id: commentId, isDeleted: { $ne: true } });
  if (!comment) {
    const err = new Error("Comment not found");
    err.statusCode = 404;
    throw err;
  }

  const existing = await Like.findOne({ user: userId, target: commentId, targetType: "Comment" });

  if (existing) {
    await existing.deleteOne();
    comment.likesCount = Math.max(0, comment.likesCount - 1);
    await comment.save();
    return { liked: false, likesCount: comment.likesCount };
  } else {
    await Like.create({ user: userId, target: commentId, targetType: "Comment" });
    comment.likesCount += 1;
    await comment.save();
    return { liked: true, likesCount: comment.likesCount };
  }
};

// ─── Accept Answer (Question posts only) ─────────────────────────────────
export const acceptAnswer = async (commentId, userId) => {
  const comment = await Comment.findOne({ _id: commentId, isDeleted: { $ne: true } }).populate("post");
  if (!comment) {
    const err = new Error("Comment not found");
    err.statusCode = 404;
    throw err;
  }

  const post = comment.post;
  if (post.author.toString() !== userId.toString()) {
    const err = new Error("Only the post author can accept an answer");
    err.statusCode = 403;
    throw err;
  }
  if (post.type !== "question") {
    const err = new Error("Answer acceptance is only for question posts");
    err.statusCode = 400;
    throw err;
  }

  // Unaccept previous accepted answer
  if (post.acceptedAnswer) {
    await Comment.findByIdAndUpdate(post.acceptedAnswer, { isAccepted: false });
  }

  comment.isAccepted = true;
  await comment.save();

  post.acceptedAnswer = comment._id;
  post.isAnswered = true;
  await post.save();

  return { message: "Answer accepted", commentId };
};
