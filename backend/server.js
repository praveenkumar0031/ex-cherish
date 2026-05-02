import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import roomRoutes from "./routes/roomRoutes.js"; 
import RoomMessage from "./models/RoomMessage.js"; 
import uploadRoutes from "./routes/uploadRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // Replace with your actual frontend URL if different
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ====== REST API ROUTES (UNTCHED) ======
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
//app.use("/api/profile", profileRoutes);
app.use("/api/rooms", roomRoutes); 
app.use("/api/profiles", profileRoutes);
app.get("/", (req, res) => {
  res.send("Excherish API is running...");
});
app.use("/api/upload", uploadRoutes);
// ====== SOCKET.IO SETUP ======
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Must match exactly
    methods: ["GET", "POST"],
    credentials: true
  },
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // --- PERSONAL CHAT (REMAINED) ---
 // --- PERSONAL CHAT (REMAINED) ---
socket.on("join", (userId) => {
  socket.join(userId); // User joins their own private channel
  console.log(`User ${userId} is ready for private messages`);
});

socket.on("sendMessage", (data) => {
  const { receiver, senderId, text, senderName } = data;
  // Emit to the receiver's private channel
  io.to(receiver).emit("receiveMessage", {
    senderId,
    text,
    senderName,
    createdAt: new Date()
  });
});

  // --- EXCHERISH ROOM CHAT (SYNCHRONIZED) ---
  
  // 1. Join a specific exchange room (1-on-1)
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined Room ${roomId}`);
  });

  // 2. Handle 1-on-1 exchange messages
  socket.on("send_message", async (data) => {
    const { room, sender, text } = data; // Match your Chat.jsx object keys
    try {
      // Save to MongoDB
      const newMsg = await RoomMessage.create({
        room,
        sender,
        text,
      });

      // Populate sender info so UI shows Name/Avatar instantly
      const populatedMsg = await newMsg.populate("sender", "name profilePic");

      // Broadcast to both users in the room
      io.to(room).emit("receive_message", populatedMsg);
    } catch (err) {
      console.error("Excherish Chat Error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Excherish Server running on port ${PORT}`));