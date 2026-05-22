import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { 
  createRoom, 
  updateRoom,
  joinRoom, 
  manageMembers,
  getOrCreatePrivateChat, 
  discoverAllCards, 
  getMyRooms,
  getAllRooms 
} from "../controllers/roomController.js";

const router = express.Router();

router.get("/", protect, getAllRooms); 
router.post("/create", protect, createRoom); 
router.put("/:roomId", protect, updateRoom);
router.post("/join/:roomId", protect, joinRoom);
router.post("/:roomId/members", protect, manageMembers);
router.get("/my-chats", protect, getMyRooms);
router.get("/discover", discoverAllCards);
router.post("/private", protect, getOrCreatePrivateChat);

export default router;
