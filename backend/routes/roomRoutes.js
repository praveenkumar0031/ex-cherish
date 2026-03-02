import express from "express";
import { 
  createSkillRoom,
  connectToExchange,
  discoverAllCards,
  getMyChats,
  getRoomMessages
} from "../controllers/roomController.js";

// Ensure your middleware file uses 'export const authmiddleware'
import { authmiddleware } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// Public Routes (viewing cards on landing page)
router.get("/discover", discoverAllCards);

// Protected Routes (Must be logged in)
router.use(authmiddleware);

router.post("/create", createSkillRoom);             // Create a card
router.post("/:roomId/connect", connectToExchange); // Join a card (1-on-1)
router.get("/my-chats", getMyChats);                // View my active 1-on-1s
router.get("/:roomId/messages", getRoomMessages);   // Get chat history

export default router;