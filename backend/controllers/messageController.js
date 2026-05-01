import Message from "../models/messageModel.js";
import Room from "../models/Room.js";

// ✅ Send Message (Works for both 1-on-1 and Group Rooms)
export const sendMessage = async (req, res) => {
  try {
    const { text, roomId } = req.body;
    const senderId = req.user.id;

    // 1. Verify user belongs to this room/chat
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: "Chat not found" });

    if (!room.members.includes(senderId)) {
      return res.status(403).json({ error: "You are not a member of this chat" });
    }

    const message = await Message.create({
      room: roomId,
      sender: senderId,
      text,
    });

    const populatedMessage = await message.populate("sender", "name profilePic");
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: "Message failed to send" });
  }
};

// ✅ Get Messages for any Chat
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ room: roomId })
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};