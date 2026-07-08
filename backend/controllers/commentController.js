import asyncHandler from "express-async-handler";
import * as commentService from "../services/commentService.js";

// @route  POST /api/comments
export const createComment = asyncHandler(async (req, res) => {
  const comment = await commentService.createComment(req.user._id, req.body);
  res.status(201).json({ success: true, comment });
});

// @route  GET /api/comments/post/:postId
export const getComments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await commentService.getCommentsByPost(
    req.params.postId,
    req.user?._id,
    { page, limit }
  );
  res.json({ success: true, ...result });
});

// @route  PUT /api/comments/:id
export const updateComment = asyncHandler(async (req, res) => {
  const comment = await commentService.updateComment(
    req.params.id,
    req.user._id,
    req.body.content
  );
  res.json({ success: true, comment });
});

// @route  DELETE /api/comments/:id
export const deleteComment = asyncHandler(async (req, res) => {
  const result = await commentService.deleteComment(
    req.params.id,
    req.user._id,
    req.user.role
  );
  res.json({ success: true, ...result });
});

// @route  POST /api/comments/:id/like
export const toggleLike = asyncHandler(async (req, res) => {
  const result = await commentService.toggleCommentLike(req.params.id, req.user._id);
  res.json({ success: true, ...result });
});

// @route  POST /api/comments/:id/accept
export const acceptAnswer = asyncHandler(async (req, res) => {
  const result = await commentService.acceptAnswer(req.params.id, req.user._id);
  res.json({ success: true, ...result });
});
