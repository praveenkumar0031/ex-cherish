import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// GET /api/profile/:userId
router.get("/:userId", getProfile);

// PUT /api/profile/:userId
router.put("/:userId", upload.single("profilePic"), updateProfile);

export default router;
