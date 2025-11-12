import express from "express";
import Room from "../models/Room.js";
import RoomMessage from "../models/RoomMessage.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all rooms
router.get("/", authMiddleware, async (req, res) => {
  const rooms = await Room.find().sort({ createdAt: -1 });
  res.json(rooms);
});

// Create a room
router.post("/create", authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Room name required" });

  const exists = await Room.findOne({ name });
  if (exists) return res.status(400).json({ message: "Room already exists" });

  const room = await Room.create({ name, createdBy: req.user.id });
  res.json(room);
});

// Get room messages
router.get("/:roomId/messages", authMiddleware, async (req, res) => {
  const messages = await RoomMessage.find({ room: req.params.roomId })
    .populate("sender", "name profilePic")
    .sort({ createdAt: 1 });
  res.json(messages);
});

export default router;
