import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { 
  createInstantCall,
  scheduleCall, 
  updateCallStatus, 
  getMyCalls, 
  getUpcomingCalls, 
  getCallHistory,
  getCallByRoomId
} from "../controllers/callController.js";

const router = express.Router();

router.get("/my-calls", protect, getMyCalls);
router.get("/upcoming", protect, getUpcomingCalls);
router.get("/history", protect, getCallHistory);
router.get("/room/:roomId", protect, getCallByRoomId);

router.post("/create", protect, createInstantCall);
router.post("/schedule", protect, scheduleCall);
router.patch("/:id/status", protect, updateCallStatus);

export default router;
