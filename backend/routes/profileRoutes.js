import express from "express";
import { getProfile, updateProfile, getAllProfiles } from "../controllers/profileController.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/all", protect, getAllProfiles);

// GET /api/profile/:userId
router.get("/:id", protect, getProfile);

// PUT /api/profile/:userId
router.put("/:userId", protect, upload.single("profilePic"), updateProfile);

export default router;
