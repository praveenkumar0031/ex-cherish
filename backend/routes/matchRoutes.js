import express from "express";
import { discoverProfiles, likeProfile} from "../controllers/matchController.js";
import { authmiddleware} from "../middleware/authMiddleware.js"; // Assuming you have JWT auth

const router = express.Router();

router.get("/discover", authmiddleware, discoverProfiles);
router.post("/like/:userId", authmiddleware, likeProfile);

export default router;