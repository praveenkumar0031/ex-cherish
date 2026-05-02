import Room from "../models/Room.js";

// ✅ 1. Consolidated Create Room/Topic
// This merges your two previous versions into one robust function
export const createRoom = async (req, res) => {
  const { name, topic, skillOffered, skillDesired } = req.body;
  const userId = req.user.id;

  try {
    if (!name) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const nameExists = await Room.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ message: "Room name already exists." });
    }

    const room = await Room.create({
      name,
      topic: topic || "General", // Default topic if not provided
      skillOffered,
      skillDesired,
      createdBy: userId,
      members: [userId],
      isGroup: true // Public skill cards are typically groups
    });

    res.status(201).json({
      message: "Room created successfully",
      room
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ 2. Join an existing Room (Skill Card)
export const joinRoom = async (req, res) => {
  const userId = req.user.id;
  const { roomId } = req.params;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.members.includes(userId)) {
      return res.status(200).json({ message: "Already a member", room });
    }

    room.members.push(userId);
    await room.save();

    res.status(200).json({ message: "Joined successfully", room });
  } catch (error) {
    res.status(500).json({ message: "Error joining room" });
  }
};

// ✅ 3. Find or Create a Private 1-on-1 Room
export const getOrCreatePrivateChat = async (req, res) => {
  const myId = req.user.id;
  const { targetUserId } = req.body;

  try {
    let room = await Room.findOne({
      isGroup: false, 
      members: { $all: [myId, targetUserId], $size: 2 }
    });

    if (!room) {
      room = await Room.create({
        name: "Private Chat",
        members: [myId, targetUserId],
        isGroup: false, 
      });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Error starting private chat" });
  }
};

// ✅ 4. Discover all Public Skill Cards
export const discoverAllCards = async (req, res) => {
  try {
    const rooms = await Room.find({ isGroup: true, status: 'active' })
      .populate("members", "name profilePic");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cards" });
  }
};

// ✅ 5. Get My Active Chats (Both Groups & Private)
export const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user.id })
      .populate("members", "name profilePic")
      .sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your chats" });
  }
};

// ✅ 6. Get All Rooms (For Admin or Global List)
export const getAllRooms = async (req, res) => {
  try {
    // 1. First, try a simple find to see if it works without population
    const rooms = await Room.find().sort({ createdAt: -1 });
    
    // 2. Log the result to the backend terminal
    console.log(`Found ${rooms.length} rooms`);
    
    res.status(200).json(rooms);
  } catch (error) {
    // This will print the specific Mongoose error to your terminal
    console.error("DATABASE QUERY ERROR:", error.message); 
    res.status(500).json({ message: "Error fetching rooms", error: error.message });
  }
};