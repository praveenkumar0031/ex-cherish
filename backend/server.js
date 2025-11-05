import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
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

// ✅ Serve uploaded images statically
//app.use("/uploads", express.static("uploads"));


// ====== REST API ROUTES ======
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);

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

// 🔥 When a user connects
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ Join room for specific username
  socket.on("join", (username) => {
    socket.join(username);
    console.log(`${username} joined their room`);
  });

  // ✅ Handle message send
  socket.on("sendMessage", (data) => {
    console.log("Message sent:", data);
    const { sender, receiver } = data;
    io.to(receiver).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
