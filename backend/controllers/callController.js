import asyncHandler from "express-async-handler";
import * as callService from "../services/callService.js";

export const createInstantCall = asyncHandler(async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (!receiverId) {
      res.status(400);
      throw new Error("Receiver ID is required");
    }

    const call = await callService.createInstantCall(req.user._id || req.user.id, receiverId);
    res.status(201).json(call);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? null : error.stack,
    });
  }
});

export const scheduleCall = asyncHandler(async (req, res) => {
  try {
    const { receiverId, scheduledFor } = req.body;
    if (!receiverId || !scheduledFor) {
      res.status(400);
      throw new Error("Receiver ID and Scheduled Date are required");
    }

    const result = await callService.createScheduledCall(req.user._id || req.user.id, receiverId, scheduledFor);
    res.status(201).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? null : error.stack,
    });
  }
});

export const updateCallStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const result = await callService.updateCallStatus(req.user.id, req.params.id, status);
  res.json(result);
});

export const getMyCalls = asyncHandler(async (req, res) => {
  const calls = await callService.getUserCalls(req.user.id);
  res.json(calls);
});

export const getUpcomingCalls = asyncHandler(async (req, res) => {
    const calls = await callService.getUserCalls(req.user.id);
    const upcoming = calls.filter(c => c.callType === "scheduled" && new Date(c.scheduledFor) > new Date() && (c.status === "scheduled" || c.status === "accepted"));
    res.json(upcoming);
});

export const getCallHistory = asyncHandler(async (req, res) => {
    const calls = await callService.getUserCalls(req.user.id);
    const history = calls.filter(c => c.status === "completed" || c.status === "rejected" || c.status === "missed" || (c.callType === "scheduled" && new Date(c.scheduledFor) < new Date()));
    res.json(history);
});

export const getCallByRoomId = asyncHandler(async (req, res) => {
    const call = await callService.getCallByRoomId(req.params.roomId);
    if (!call) {
        res.status(404);
        throw new Error("Call not found");
    }
    res.json(call);
});
