import Room from "../models/Room.js";
import RoomMessage from "../models/RoomMessage.js";

/**
 * @desc    Create a unique 1-on-1 Skill Exchange Card (Room)
 */
export const createSkillRoom = async (req, res) => {
  const { name, skillOffered, skillDesired } = req.body;
  const userId = req.user.id;

  try {
    // 1. Check if the Room Name is taken platform-wide
    const nameExists = await Room.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ message: "This room name is already taken." });
    }

    // 2. Check if this user already has a card for this specific skill
    const skillExists = await Room.findOne({ createdBy: userId, skillOffered });
    if (skillExists) {
      return res.status(400).json({ message: `You are already offering ${skillOffered}.` });
    }

    const room = await Room.create({
      name,
      skillOffered,
      skillDesired,
      createdBy: userId,
      members: [userId], 
      status: 'active'
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Connect a second user to a Skill Card (Starts 1-on-1 Chat)
 */
export const connectToExchange = async (req, res) => {
  const userId = req.user.id;
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) return res.status(404).json({ message: "Exchange card not found" });

    // Enforce 1-on-1: Check if room is full
    if (room.members.length >= 2 && !room.members.includes(userId)) {
      return res.status(403).json({ message: "This exchange is already in progress." });
    }

    // Add user if they aren't already a member
    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    res.json({ message: "Connected successfully", room });
  } catch (error) {
    res.status(500).json({ message: "Error connecting to exchange" });
  }
};

/**
 * @desc    Get all rooms available on the landing page (only 1 member)
 */
export const discoverAllCards = async (req, res) => {
  try {
    // Show cards that have only 1 member (the creator) and are active
    const rooms = await Room.find({ 
      members: { $size: 1 }, 
      status: 'active' 
    }).populate("createdBy", "name profilePic");
    
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cards" });
  }
};

/**
 * @desc    Get user's private active chats (where members = 2)
 */
export const getMyChats = async (req, res) => {
  try {
    const rooms = await Room.find({ 
      members: req.user.id,
      members: { $size: 2 } 
    }).populate("members", "name profilePic");
    
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats" });
  }
};

/**
 * @desc    Get message history
 */
export const getRoomMessages = async (req, res) => {
  try {
    const messages = await RoomMessage.find({ room: req.params.roomId })
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};