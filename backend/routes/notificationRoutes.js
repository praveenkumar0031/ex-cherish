import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { 
  getMyNotifications, 
  markRead, 
  clearAll, 
  createNotification 
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.post("/create", protect, createNotification);
router.put("/:id/read", protect, markRead);
router.delete("/clear", protect, clearAll);

export default router;
