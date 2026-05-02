import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // Ensure .js is here too!

// Use 'export const' to match the named import in your routes
export const authmiddleware = async (req, res, next) => {
  let token;
  console.log("Auth Header Received:", req.headers.authorization); // Debug Log

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token Data:", decoded); // Debug Log
      
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        console.log("No user found in DB for ID:", decoded.id);
        return res.status(401).json({ message: "User no longer exists" });
      }
      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message); // Debug Log
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  // ... rest of code
};