import express from "express";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/**
 * @route   POST /api/upload
 * @desc    Upload a single image and return the path
 */
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Return the path that the frontend can use to display the image
  res.json({
    message: "Image uploaded successfully",
    imageUrl: `/uploads/${req.file.filename}`
  });
});

export default router;