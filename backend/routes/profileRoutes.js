import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";

const router = express.Router();

// GET /api/profile/:userId
router.get("/:userId", getProfile);

// PUT /api/profile/:userId
router.put("/:userId", updateProfile);

export default router;
