import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import initSocket from "./sockets/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Route imports
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import roomRoutes from "./routes/roomRoutes.js"; 
import uploadRoutes from "./routes/uploadRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Sockets
initSocket(server);

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/chat", roomRoutes); 
app.use("/api/users", profileRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Excherish API is running smoothly...");
});

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Excherish Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
