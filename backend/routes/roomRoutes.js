// routes/roomRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  getRooms,
  createRoom,
  joinRoom,
  getRoomMembers,
  getRoomMessages,
  getRoomStats
} from "../controllers/roomController.js";

const router = express.Router();

/* GET all rooms */
router.get("/", authMiddleware, getRooms);

/* Create room */
router.post("/create", authMiddleware, createRoom);

/* Join room */
router.post("/:roomId/join", authMiddleware, joinRoom);


router.get("/:roomId/members", authMiddleware, getRoomMembers);
router.get("/:roomId/messages", authMiddleware, getRoomMessages);

router.get("/:roomId/stats", authMiddleware, getRoomStats);

export default router;
