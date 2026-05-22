import express from "express";
import { createMeeting, joinMeeting } from "../controllers/meetingController.js";
import { authmiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authmiddleware, createMeeting);
router.get("/join/:meetingId", authmiddleware, joinMeeting);

export default router;
