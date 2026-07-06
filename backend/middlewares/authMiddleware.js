import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// BUG FIX: Previous version had a control flow bug where `res.status(401)` could be set
// twice — once inside the catch block and again in the outer `if (!token)` check.
// Also, the `if (!token)` was placed after the authorization block, so a missing header
// would never be caught before the block ran. Fixed with early-return pattern.
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token is malformed");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401);
    if (err.name === "TokenExpiredError") {
      throw new Error("Session expired, please login again");
    }
    throw new Error("Not authorized, invalid token");
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    res.status(401);
    throw new Error("Not authorized, user account not found");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Your account has been suspended");
  }

  req.user = user;
  next();
});

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Access denied. Required role: ${roles.join(" or ")}`);
    }
    next();
  };
};
