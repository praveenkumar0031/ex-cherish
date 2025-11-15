// controllers/roomController.js
import Room from "../models/Room.js";
import RoomMessage from "../models/RoomMessage.js";

/* ----------------------- Get all rooms ----------------------- */
export const getRooms = async (req, res) => {
  const rooms = await Room.find().sort({ createdAt: -1 });
  res.json(rooms);
};

/* ----------------------- Create room ----------------------- */
export const createRoom = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Room name required" });

  const exists = await Room.findOne({ name });
  if (exists) return res.status(400).json({ message: "Room already exists" });

  const room = await Room.create({
    name,
    createdBy: req.user.id,
    members: [req.user.id],
  });

  res.json(room);
};

/* ----------------------- Join room ----------------------- */
export const joinRoom = async (req, res) => {
  const roomId = req.params.roomId;

  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: "Room not found" });

  if (!room.members.includes(req.user.id)) {
    room.members.push(req.user.id);
    await room.save();
  }

  res.json({ message: "Joined room", room });
};

/* ----------------------- Get Room Members ----------------------- */
export const getRoomMembers = async (req, res) => {
  const room = await Room.findById(req.params.roomId)
    .populate("members", "name email profilePic");

  if (!room) return res.status(404).json({ message: "Room not found" });

  res.json(room.members);
};

/* ----------------------- Get Room Messages ----------------------- */
export const getRoomMessages = async (req, res) => {
  const messages = await RoomMessage.find({ room: req.params.roomId })
    .populate("sender", "name profilePic")
    .sort({ createdAt: 1 });

  res.json(messages);
};

/* ----------------------- NEW: Room Stats ----------------------- */
/*
   Returns:
   - totalMembers
   - totalMessages
   - uniqueUsersTexted
*/
export const getRoomStats = async (req, res) => {
  const roomId = req.params.roomId;

  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: "Room not found" });

  const messages = await RoomMessage.find({ room: roomId }).populate(
    "sender",
    "_id"
  );

  const uniqueUsers = new Set(messages.map((m) => m.sender._id.toString()));

  res.json({
    totalMembers: room.members.length,
    totalMessages: messages.length,
    uniqueUsersTexted: uniqueUsers.size,
  });
};
