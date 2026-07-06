import asyncHandler from "express-async-handler";
import * as userService from "../services/userService.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const result = await userService.register(req.body);
  res.status(201).json(result);
});

// @desc    Authenticate a user and get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await userService.login(email, password);
  res.status(200).json(result);
});

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  // req.user is set by protect middleware
  res.json({
    _id: req.user._id,
    name: req.user.name,
    username: req.user.username,
    email: req.user.email,
    profilePic: req.user.profilePic,
    role: req.user.role,
    isVerified: req.user.isVerified,
    lastSeen: req.user.lastSeen,
  });
});
