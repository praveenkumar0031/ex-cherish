import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/room/:roomId", protect, getMessages); 
router.get("/private", protect, getMessages);

export default router;
