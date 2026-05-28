import Message from "../models/Message.js";
import Room from "../models/Room.js";
import * as notificationService from "./notificationService.js";

export const createMessage = async (senderId, messageData) => {
  const { text, roomId, receiverId } = messageData;

  let data = {
    sender: senderId,
    text,
  };

  let notification = null;

  if (roomId) {
    const room = await Room.findById(roomId);
    if (!room) throw new Error("Chat room not found");
    const members = room.members || room.users || [];
    if (!members.some(id => id.toString() === senderId.toString())) {
      throw new Error("You are not a member of this chat");
    }
    data.room = roomId;
  } else if (receiverId) {
    data.receiver = receiverId;
    
    // Notify the receiver for private messages
    notification = await notificationService.createNotification({
      recipientId: receiverId,
      senderId: senderId,
      type: "new_message",
      message: "sent you a new message."
    });
  } else {
    throw new Error("Either roomId or receiverId is required");
  }

  const message = await Message.create(data);
  const populatedMessage = await message.populate("sender", "name profilePic");
  
  return { message: populatedMessage, notification };
};

export const fetchMessages = async (params) => {
  const { roomId, sender, receiver, page = 1, limit = 100 } = params;

  let query = {};
  
  if (roomId) {
    query = { room: roomId };
  } else if (sender && receiver) {
    query = {
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender }
      ]
    };
  } else {
    throw new Error("Missing parameters for message retrieval");
  }

  const skip = (page - 1) * limit;

  // We sort by createdAt: -1 to get the newest first, then limit, then sort back to chronological order
  const messages = await Message.find(query)
    .populate("sender", "name profilePic")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return messages.reverse();
};
