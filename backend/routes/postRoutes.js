import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createPost, getPosts, getPost, updatePost, deletePost,
  toggleLike, toggleBookmark, getUserPosts,
  getBookmarked, getPopularTags,
} from "../controllers/postController.js";

const router = express.Router();

// Public routes (auth optional for liked/bookmarked flags)
router.get("/", protect, getPosts);
router.get("/bookmarked", protect, getBookmarked);
router.get("/tags/popular", protect, getPopularTags);
router.get("/user/:userId", protect, getUserPosts);
router.get("/:id", protect, getPost);

// Authenticated routes
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/bookmark", protect, toggleBookmark);

export default router;
