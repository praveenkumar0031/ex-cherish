import Message from "../models/messageModel.js";
import Room from "../models/Room.js";

export const createMessage = async (senderId, messageData) => {
  const { text, roomId, receiverId } = messageData;

  let data = {
    sender: senderId,
    text,
  };

  if (roomId) {
    const room = await Room.findById(roomId);
    if (!room) throw new Error("Chat room not found");
    // Compatibility check for members: some models might use 'members', others 'users'
    const members = room.members || room.users || [];
    if (!members.some(id => id.toString() === senderId.toString())) {
      throw new Error("You are not a member of this chat");
    }
    data.room = roomId;
  } else if (receiverId) {
    data.receiver = receiverId;
  } else {
    throw new Error("Either roomId or receiverId is required");
  }

  const message = await Message.create(data);
  return await message.populate("sender", "name profilePic");
};

export const fetchMessages = async (params) => {
  const { roomId, sender, receiver } = params;

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

  return await Message.find(query)
    .populate("sender", "name profilePic")
    .sort({ createdAt: 1 });
};
