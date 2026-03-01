import express from "express";
import { 
  initiateConnection, 
  getMyExchanges, 
  getExchangeMessages,
  markAsCompleted 
} from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js"; // Assuming you have auth middleware

const router = express.Router();
// All routes are protected
router.use(protect);

// Initialize or get a room between two users for a skill
router.post("/initialize", initiateConnection);

// Get all chat rooms the logged-in user is part of
router.get("/my-exchanges", getMyExchanges);

// Get messages for a specific room
router.get("/:roomId/messages", getExchangeMessages);

// Feature: Mark a skill exchange as 'completed'
router.patch("/:roomId/complete", markAsCompleted);

export default router;