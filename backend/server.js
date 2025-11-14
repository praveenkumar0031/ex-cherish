import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import roomRoutes from "./routes/roomRoutes.js"; // New room routes
import Room from "./models/Room.js";
import RoomMessage from "./models/RoomMessage.js"; // Room messages
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

// Fix ES module dirname issue
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ====== REST API ROUTES ======
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/rooms", roomRoutes); // New room API

// ====== Test route ======
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ====== SOCKET.IO SETUP ======
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// ================= PERSONAL CHAT =================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ Join room for personal username
  socket.on("join", (username) => {
    socket.join(username);
    console.log(`${username} joined their room`);
  });

  // ✅ Handle personal messages
  socket.on("sendMessage", (data) => {
    const { sender, receiver } = data;
    io.to(receiver).emit("receiveMessage", data);
  });

  // ================= ROOM CHAT =================
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("sendRoomMessage", async (data) => {
    const { roomId, userId, text } = data;
    try {
      // Save message in DB
      const newMsg = await RoomMessage.create({
        room: roomId,
        sender: userId,
        text,
      });

      const populatedMsg = await newMsg.populate("sender", "name profilePic");

      // Emit to everyone in room
      io.to(roomId).emit("newRoomMessage", populatedMsg);
    } catch (err) {
      console.error("Room message error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
