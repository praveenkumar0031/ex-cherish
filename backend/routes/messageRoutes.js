import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";
import { authmiddleware } from "../middleware/authMiddleware.js"; // Ensure user is logged in

const router = express.Router();

router.post("/send", authmiddleware, sendMessage);
// Support both /api/messages/get (query params) and /api/messages/get/:roomId
router.get("/room/:roomId", authmiddleware, getMessages); 
router.get("/private", authmiddleware, getMessages);

export default router;