import asyncHandler from "express-async-handler";
import * as userService from "../services/userService.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const user = await userService.register(req.body);
  res.status(201).json(user);
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await userService.login(email, password);
  res.json(result);
});
