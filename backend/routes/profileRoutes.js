import express from "express";
import { getProfile, updateProfile,getAllProfiles } from "../controllers/profileController.js";
import { upload } from "../middleware/upload.js";
import { authmiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/all",authmiddleware, getAllProfiles);
// GET /api/profile/:userId
router.get("/:userId", getProfile);

// PUT /api/profile/:userId
router.put("/:userId", upload.single("profilePic"), updateProfile);

export default router;
