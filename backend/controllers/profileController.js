import asyncHandler from "express-async-handler";
import * as profileService from "../services/profileService.js";

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.fetchProfile(req.params.id);
  res.json(profile);
});

// @desc    Update user profile
// @route   PUT /api/users/:userId
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const result = await profileService.modifyProfile(req.params.userId, req.body, req.file);
  res.json({
    message: "Profile updated successfully",
    ...result,
  });
});

// @desc    Get all profiles for discovery
// @route   GET /api/users/all
// @access  Private
export const getAllProfiles = asyncHandler(async (req, res) => {
  const profiles = await profileService.fetchAllProfiles();
  res.json(profiles);
});
