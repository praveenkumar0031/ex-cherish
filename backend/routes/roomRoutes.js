import express from "express";
import { authmiddleware } from "../middleware/authMiddleware.js";
import { 
  createRoom, 
  joinRoom, 
  getOrCreatePrivateChat, 
  discoverAllCards, 
  getMyRooms,
  getAllRooms 
} from "../controllers/roomController.js";

const router = express.Router();

// Route to fetch all rooms (used by RoomsPage.jsx)
router.get("/", authmiddleware, getAllRooms); 

// FIX: Add this line to handle POST http://localhost:5000/api/rooms/create
router.post("/create", authmiddleware, createRoom); 

router.get("/my-chats", authmiddleware, getMyRooms);
router.get("/discover", discoverAllCards);
router.post("/private", authmiddleware, getOrCreatePrivateChat);

export default router;