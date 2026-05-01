import Room from "../models/Room.js";

// ✅ 1. Create a new Room/Topic (Skill Exchange Card)
export const createRoom = async (req, res) => {
  const { name, topic, skillOffered, skillDesired } = req.body;
  const userId = req.user.id;

  try {
    const nameExists = await Room.findOne({ name });
    if (nameExists) return res.status(400).json({ message: "Room name already exists." });

    const room = await Room.create({
      name,
      topic, 
      skillOffered,
      skillDesired,
      createdBy: userId,
      members: [userId],
      isGroup: true // Public skill cards are groups
    });

    res.status(201).json(room);
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

// ✅ 3. Find or Create a Private 1-on-1 Room (Dating/Matching Style)
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

// ✅ 4. Discover all Public Skill Cards (For Landing Page)
export const discoverAllCards = async (req, res) => {
  try {
    // Fetch rooms that are groups and have only 1 member (waiting for a partner)
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