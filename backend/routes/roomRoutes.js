import express from "express";
import { authmiddleware } from "../middleware/authMiddleware.js";
import { 
  createRoom, 
  joinRoom, 
  getOrCreatePrivateChat, 
  discoverAllCards, 
  getMyRooms 
} from "../controllers/roomController.js";

// ... route definitions

const router = express.Router();

router.get("/my-chats", authmiddleware, getMyRooms);
router.get("/discover", discoverAllCards);
router.post("/private", authmiddleware, getOrCreatePrivateChat);
export default router;