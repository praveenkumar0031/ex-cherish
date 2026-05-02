import Message from "../models/messageModel.js";
import Room from "../models/Room.js";

export const sendMessage = async (req, res) => {
  try {
    const { text, roomId, receiverId } = req.body; // Added receiverId for 1-on-1
    const senderId = req.user.id;

    let messageData = {
      sender: senderId,
      text,
    };

    // Logic for Room Chat
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) return res.status(404).json({ error: "Chat room not found" });
      if (!room.members.includes(senderId)) {
        return res.status(403).json({ error: "You are not a member of this chat" });
      }
      messageData.room = roomId;
    } 
    // Logic for Private 1-on-1 Chat
    else if (receiverId) {
      messageData.receiver = receiverId;
    } else {
      return res.status(400).json({ error: "Either roomId or receiverId is required" });
    }

    const message = await Message.create(messageData);
    const populatedMessage = await message.populate("sender", "name profilePic");
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: "Message failed to send" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params; // From /room/:roomId
    const { sender, receiver } = req.query; // From /private?sender=...

    let query = {};
    
    if (roomId) {
      // Logic for Room-based messages
      query = { room: roomId };
    } else if (sender && receiver) {
      // Logic for Private 1-on-1 messages
      query = {
        $or: [
          { sender: sender, receiver: receiver },
          { sender: receiver, receiver: sender }
        ]
      };
    } else {
      return res.status(400).json({ error: "Missing parameters for message retrieval" });
    }

    const messages = await Message.find(query)
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};
export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    // Find messages where the 'room' field matches the ID
    const messages = await Message.find({ room: roomId })
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 }); // Sort by time, oldest first
      
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};