import Room from "../models/Room.js";

export const createNewRoom = async (userId, roomData) => {
  const { name, topic, description, avatar, skillOffered, skillDesired } = roomData;

  if (!name) {
    throw new Error("Room name is required");
  }

  const nameExists = await Room.findOne({ name });
  if (nameExists) {
    throw new Error("Room name already exists");
  }

  return await Room.create({
    name,
    topic: topic || "General",
    description: description || "",
    avatar: avatar || "",
    skillOffered,
    skillDesired,
    createdBy: userId,
    members: [userId],
    admins: [userId],
    isGroup: true
  });
};

export const updateRoomDetails = async (userId, roomId, updateData) => {
  const room = await Room.findById(roomId);
  if (!room) throw new Error("Room not found");

  if (!room.admins.some(id => id.toString() === userId.toString())) {
    throw new Error("Only admins can update room details");
  }

  return await Room.findByIdAndUpdate(roomId, updateData, { new: true });
};

export const joinExistingRoom = async (userId, roomId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new Error("Room not found");

  if (room.members.some(id => id.toString() === userId.toString())) {
    return room;
  }

  room.members.push(userId);
  await room.save();
  return room;
};

export const manageMember = async (adminId, roomId, memberId, action) => {
  const room = await Room.findById(roomId);
  if (!room) throw new Error("Room not found");

  if (!room.admins.some(id => id.toString() === adminId.toString())) {
    throw new Error("Only admins can manage members");
  }

  if (action === "add") {
    if (!room.members.some(id => id.toString() === memberId.toString())) room.members.push(memberId);
  } else if (action === "remove") {
    room.members = room.members.filter(m => m.toString() !== memberId);
    room.admins = room.admins.filter(a => a.toString() !== memberId);
  }

  await room.save();
  return room;
};

export const findOrCreatePrivate = async (myId, targetUserId) => {
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

  return room;
};

export const getPublicRooms = async () => {
  return await Room.find({ isGroup: true, status: 'active' })
    .populate("members", "name profilePic");
};

export const getUserRooms = async (userId) => {
  return await Room.find({ members: userId })
    .populate("members", "name profilePic")
    .sort({ updatedAt: -1 });
};

export const listAllRooms = async () => {
  return await Room.find().sort({ createdAt: -1 });
};
