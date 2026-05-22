import express from "express";
import { discoverProfiles, likeProfile, getMyMatches, getMatchStats } from "../controllers/matchController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/discover", protect, discoverProfiles);
router.get("/my-matches", protect, getMyMatches);
router.get("/debug-stats", protect, getMatchStats);
router.post("/like", protect, likeProfile);

export default router;
