import asyncHandler from "express-async-handler";
import * as messageService from "../services/messageService.js";

// @desc    Send a message (Room or Private)
// @route   POST /api/messages/send
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { message } = await messageService.createMessage(req.user.id, req.body);
  res.status(201).json(message);
});

// @desc    Get messages for a room or private chat
// @route   GET /api/messages/room/:roomId or /api/messages/private
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { sender, receiver, page, limit } = req.query;

  const messages = await messageService.fetchMessages({ roomId, sender, receiver, page, limit });
  res.json(messages);
});

// Alias for backward compatibility if needed in routes
export const getRoomMessages = getMessages;
