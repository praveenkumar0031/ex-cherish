import asyncHandler from "express-async-handler";
import * as roomService from "../services/roomService.js";

// @desc    Create a new room
// @route   POST /api/rooms/create
// @access  Private
export const createRoom = asyncHandler(async (req, res) => {
  const room = await roomService.createNewRoom(req.user.id, req.body);
  res.status(201).json({
    message: "Room created successfully",
    room
  });
});

// @desc    Update room details
// @route   PUT /api/rooms/:roomId
// @access  Private (Admin only)
export const updateRoom = asyncHandler(async (req, res) => {
  const room = await roomService.updateRoomDetails(req.user.id, req.params.roomId, req.body);
  res.json({ message: "Room updated successfully", room });
});

// @desc    Join an existing room
// @route   POST /api/rooms/join/:roomId
// @access  Private
export const joinRoom = asyncHandler(async (req, res) => {
  const room = await roomService.joinExistingRoom(req.user.id, req.params.roomId);
  res.status(200).json({ message: "Joined successfully", room });
});

// @desc    Manage room members (Add/Remove)
// @route   POST /api/rooms/:roomId/members
// @access  Private (Admin only)
export const manageMembers = asyncHandler(async (req, res) => {
  const { userId, action } = req.body;
  const room = await roomService.manageMember(req.user.id, req.params.roomId, userId, action);
  res.json({ message: `Member ${action}ed successfully`, room });
});

// @desc    Find or create a private 1-on-1 room
// @route   POST /api/rooms/private
// @access  Private
export const getOrCreatePrivateChat = asyncHandler(async (req, res) => {
  const room = await roomService.findOrCreatePrivate(req.user.id, req.body.targetUserId);
  res.json(room);
});

// @desc    Discover all public rooms
// @route   GET /api/rooms/discover
// @access  Public
export const discoverAllCards = asyncHandler(async (req, res) => {
  const rooms = await roomService.getPublicRooms();
  res.json(rooms);
});

// @desc    Get current user's rooms
// @route   GET /api/rooms/my-chats
// @access  Private
export const getMyRooms = asyncHandler(async (req, res) => {
  const rooms = await roomService.getUserRooms(req.user.id);
  res.json(rooms);
});

// @desc    Get all rooms (Global)
// @route   GET /api/rooms/
// @access  Private
export const getAllRooms = asyncHandler(async (req, res) => {
  const rooms = await roomService.listAllRooms();
  res.status(200).json(rooms);
});
