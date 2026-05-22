import express from "express";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({
    message: "Image uploaded successfully",
    imageUrl: `/uploads/${req.file.filename}`
  });
});

export default router;
