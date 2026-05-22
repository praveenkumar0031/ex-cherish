import asyncHandler from "express-async-handler";
import * as matchService from "../services/matchService.js";

// @desc    Discover profiles based on mutual interests
// @route   GET /api/matches/discover
// @access  Private
export const discoverProfiles = asyncHandler(async (req, res) => {
  const suggestions = await matchService.getDiscoveries(req.user.id);
  res.json(suggestions);
});

// @desc    Like a profile and handle mutual matches
// @route   POST /api/matches/like
// @access  Private
export const likeProfile = asyncHandler(async (req, res) => {
  // Try to get targetUserId from either params or body for flexibility
  const targetUserId = req.params.userId || req.body.userId;
  
  if (!targetUserId) {
    res.status(400);
    throw new Error("Target User ID is required");
  }

  const result = await matchService.processLike(req.user.id, targetUserId);
  res.json(result);
});

// @desc    Get all mutual matches
// @route   GET /api/matches/my-matches
// @access  Private
export const getMyMatches = asyncHandler(async (req, res) => {
  const matches = await matchService.getMyMatches(req.user.id);
  res.json(matches);
});

// @desc    Get match counts and debug stats
// @route   GET /api/matches/debug-stats
// @access  Private
export const getMatchStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const Match = (await import("../models/Match.js")).default;
    const Room = (await import("../models/Room.js")).default;

    const totalMatches = await Match.countDocuments({ users: userId });
    const mutualMatches = await Match.countDocuments({ users: userId, status: "matched" });
    const privateRooms = await Room.countDocuments({ members: userId, isGroup: false });

    res.json({
        userId,
        totalMatches,
        mutualMatches,
        privateRooms,
        message: "If these counts are zero, no matches exist in the database for this user."
    });
});
