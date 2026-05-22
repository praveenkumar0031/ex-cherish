import * as messageService from "../services/messageService.js";
import * as callService from "../services/callService.js";
import Notification from "../models/Notification.js";

// Keep track of online users
const onlineUsers = new Map(); // userId -> socketId

const chatHandler = (io, socket) => {
  // Join Private Room for 1-on-1 and status
  socket.on("join", () => {
    const userId = socket.user.id;
    if (!userId) return;
    
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} joined personal channel`);
    
    // Broadcast online status
    io.emit("user_status", { userId, status: "online" });
  });

  // Typing Indicators
  socket.on("typing", (data) => {
    const { receiverId, isTyping } = data;
    const senderId = socket.user.id;
    if (receiverId) {
      io.to(receiverId).emit("user_typing", { senderId, isTyping });
    }
  });

  // Send Message (Unified for Private/Room)
  socket.on("sendMessage", async (data) => {
    const { receiver, text, senderName, roomId } = data;
    const senderId = socket.user.id;
    
    try {
      // Save to database
      const savedMessage = await messageService.createMessage(senderId, {
        text,
        roomId,
        receiverId: receiver
      });

      const messageData = {
        _id: savedMessage._id,
        senderId,
        text,
        senderName,
        createdAt: savedMessage.createdAt,
        roomId,
        sender: savedMessage.sender
      };

      if (roomId) {
        io.to(roomId).emit("receiveMessage", messageData);
      } else if (receiver) {
        io.to(receiver).to(senderId).emit("receiveMessage", messageData);
        
        // Notify receiver about new message if not in chat (optional)
      }
    } catch (err) {
      console.error("Error in sendMessage socket event:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Mark messages as read
  socket.on("mark_read", (data) => {
    const { senderId, receiverId } = data;
    io.to(senderId).emit("messages_read", { readerId: receiverId });
  });

  // Room Chat
  socket.on("join_room", (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined Room ${roomId}`);
  });

  socket.on("disconnect", () => {
    let disconnectedUserId = null;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }

    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      io.emit("user_status", { userId: disconnectedUserId, status: "offline" });
      console.log(`User ${disconnectedUserId} went offline`);
    }
    console.log("User disconnected:", socket.id);
  });
};

export default chatHandler;
