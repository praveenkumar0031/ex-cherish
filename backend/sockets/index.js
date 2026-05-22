import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import chatHandler from "./chatHandler.js";
import webrtcHandler from "./webrtcHandler.js";

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Add user info to socket
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Authenticated: ${socket.user.id} (${socket.id})`);
    
    // Register handlers
    chatHandler(io, socket);
    webrtcHandler(io, socket);

    // Notification helper
    socket.on("notify_user", (data) => {
        const { recipientId, notification } = data;
        io.to(recipientId).emit("new_notification", notification);
    });
  });

  return io;
};

export default initSocket;
