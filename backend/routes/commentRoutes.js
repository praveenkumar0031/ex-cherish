import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createComment, getComments, updateComment,
  deleteComment, toggleLike, acceptAnswer,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/", protect, createComment);
router.get("/post/:postId", protect, getComments);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/accept", protect, acceptAnswer);

export default router;
