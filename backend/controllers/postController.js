import asyncHandler from "express-async-handler";
import * as postService from "../services/postService.js";

// @route  POST /api/posts
export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.user._id, req.body);
  res.status(201).json({ success: true, post });
});

// @route  GET /api/posts
export const getPosts = asyncHandler(async (req, res) => {
  const { page, limit, type, category, tag, search, sort } = req.query;
  const result = await postService.getPosts({
    page, limit, type, category, tag, search, sort,
    userId: req.user?._id,
  });
  res.json({ success: true, ...result });
});

// @route  GET /api/posts/bookmarked
export const getBookmarked = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await postService.getBookmarkedPosts(req.user._id, { page, limit });
  res.json({ success: true, ...result });
});

// @route  GET /api/posts/tags/popular
export const getPopularTags = asyncHandler(async (req, res) => {
  const tags = await postService.getPopularTags(req.query.limit);
  res.json({ success: true, tags });
});

// @route  GET /api/posts/user/:userId
export const getUserPosts = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await postService.getUserPosts(
    req.params.userId,
    req.user?._id,
    { page, limit, status }
  );
  res.json({ success: true, ...result });
});

// @route  GET /api/posts/:id
export const getPost = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id, req.user?._id);
  res.json({ success: true, post });
});

// @route  PUT /api/posts/:id
export const updatePost = asyncHandler(async (req, res) => {
  const post = await postService.updatePost(req.params.id, req.user._id, req.body);
  res.json({ success: true, post });
});

// @route  DELETE /api/posts/:id
export const deletePost = asyncHandler(async (req, res) => {
  const result = await postService.deletePost(req.params.id, req.user._id, req.user.role);
  res.json({ success: true, ...result });
});

// @route  POST /api/posts/:id/like
export const toggleLike = asyncHandler(async (req, res) => {
  const result = await postService.toggleLike(req.params.id, req.user._id);
  res.json({ success: true, ...result });
});

// @route  POST /api/posts/:id/bookmark
export const toggleBookmark = asyncHandler(async (req, res) => {
  const result = await postService.toggleBookmark(req.params.id, req.user._id);
  res.json({ success: true, ...result });
});
