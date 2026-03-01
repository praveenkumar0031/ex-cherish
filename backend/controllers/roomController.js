import Room from "../models/Room.js";
import RoomMessage from "../models/RoomMessage.js";

/**
 * @desc    Start a connection with another user for a skill swap
 * @route   POST /api/rooms/initialize
 */
export const initiateConnection = async (req, res) => {
  const { receiverId, skillOffered, skillDesired } = req.body;
  const senderId = req.user.id;

  if (senderId === receiverId) {
    return res.status(400).json({ message: "You cannot exchange skills with yourself!" });
  }

  try {
    // Check if a room already exists between these two for THIS specific skill
    let room = await Room.findOne({
      members: { $all: [senderId, receiverId] },
      skillOffered: skillOffered
    });

    if (!room) {
      room = await Room.create({
        name: `Exchange: ${skillOffered}`,
        createdBy: senderId,
        members: [senderId, receiverId],
        skillOffered,
        skillDesired,
        status: 'active'
      });
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get all active exchanges for the logged-in user
 * @route   GET /api/rooms/my-exchanges
 */
export const getMyExchanges = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user.id })
      .populate("members", "name profilePic skills") // Show who you are talking to
      .sort({ updatedAt: -1 });
    
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
};

/**
 * @desc    Get message history for a room
 * @route   GET /api/rooms/:roomId/messages
 */
export const getExchangeMessages = async (req, res) => {
  try {
    const messages = await RoomMessage.find({ room: req.params.roomId })
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

/**
 * @desc    Update status to completed
 * @route   PATCH /api/rooms/:roomId/complete
 */
export const markAsCompleted = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.roomId, 
      { status: 'completed' }, 
      { new: true }
    );
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};