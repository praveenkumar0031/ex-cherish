import Profile from "../models/Profile.js";
import Match from "../models/Match.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import * as notificationService from "./notificationService.js";

export const getDiscoveries = async (userId) => {
  try {
    // 1. Get current user's profile to see interests
    const myProfile = await Profile.findOne({ user: userId });
    
    // Ensure we have a valid array to intersect with
    const myInterests = (myProfile && Array.isArray(myProfile.interestedAreas)) 
      ? myProfile.interestedAreas 
      : [];

    // 2. Find already matched or pending IDs to exclude
    const existingMatches = await Match.find({
      users: userId
    });
    
    let excludedUserIds = existingMatches.map(m => {
      const otherId = m.users.find(id => id && id.toString() !== userId.toString());
      return otherId ? otherId : null;
    }).filter(id => id !== null);
    
    excludedUserIds.push(userId); // Exclude self

    const myTags = (myProfile && Array.isArray(myProfile.tags)) ? myProfile.tags : [];
    const myCategories = (myProfile && Array.isArray(myProfile.categories)) ? myProfile.categories : [];

    // 3. Algorithm: Interest-based ranking (Multiple criteria)
    const suggestions = await Profile.aggregate([
      {
        $match: {
          user: { $nin: excludedUserIds },
        }
      },
      {
        $addFields: {
          interestScore: {
            $size: { $setIntersection: [{ $ifNull: ["$interestedAreas", []] }, myInterests] }
          },
          tagScore: {
            $size: { $setIntersection: [{ $ifNull: ["$tags", []] }, myTags] }
          },
          categoryScore: {
            $size: { $setIntersection: [{ $ifNull: ["$categories", []] }, myCategories] }
          }
        }
      },
      {
        $addFields: {
          matchScore: { $add: ["$interestScore", "$tagScore", "$categoryScore"] }
        }
      },
      { $sort: { matchScore: -1, createdAt: -1 } },
      { $limit: 20 }
    ]);

    // 4. Populate user details
    const populated = await Profile.populate(suggestions, { path: "user", select: "name profilePic" });
    
    // Filter out suggestions where user populate failed (e.g. deleted user)
    return populated.filter(p => p.user != null);
  } catch (err) {
    console.error("Match Discovery Error:", err);
    return []; // Safe fallback
  }
};

export const getMyMatches = async (userId) => {
  try {
    // 1. Find all match documents where this user is involved
    const allMatchDocs = await Match.find({
      users: userId
    }).populate("users", "name profilePic email");

    const processedMatches = allMatchDocs.map(m => {
        const otherUser = m.users.find(u => {
            const uId = u._id ? u._id.toString() : u.toString();
            return uId !== userId.toString();
        });

        if (!otherUser || !otherUser._id) return null;

        // Determine relationship status
        const iLiked = m.likes.some(id => id.toString() === userId.toString());
        const theyLiked = m.likes.some(id => id.toString() === otherUser._id.toString());
        
        let connectionStatus = "pending";
        if (iLiked && theyLiked) connectionStatus = "matched";
        else if (theyLiked) connectionStatus = "they_liked";
        else if (iLiked) connectionStatus = "i_liked";

        return {
            _id: otherUser._id,
            name: otherUser.name || "Anonymous",
            profilePic: otherUser.profilePic,
            email: otherUser.email,
            status: connectionStatus,
            matchId: m._id
        };
    }).filter(u => u != null);

    // 2. Find private rooms (1-on-1)
    const privateRooms = await Room.find({
        members: userId,
        isGroup: false
    }).populate("members", "name profilePic email");

    const fromRooms = privateRooms.map(r => {
        const otherUser = r.members.find(u => {
            const uId = u._id ? u._id.toString() : u.toString();
            return uId !== userId.toString();
        });
        
        if (!otherUser || !otherUser._id) return null;

        return {
            _id: otherUser._id,
            name: otherUser.name || "Anonymous",
            profilePic: otherUser.profilePic,
            email: otherUser.email,
            status: "connected", // Existing chat room implies connection
            roomId: r._id
        };
    }).filter(u => u != null);

    // 3. Combine and deduplicate (prefer 'matched' or 'connected' status)
    const combined = [...processedMatches, ...fromRooms];
    const uniqueMap = new Map();

    combined.forEach(conn => {
        const id = conn._id.toString();
        if (!uniqueMap.has(id)) {
            uniqueMap.set(id, conn);
        } else {
            // If already exists, upgrade status if new one is 'matched' or 'connected'
            const existing = uniqueMap.get(id);
            if (conn.status === "matched" || conn.status === "connected") {
                uniqueMap.set(id, conn);
            }
        }
    });

    const result = Array.from(uniqueMap.values());
    return result;
  } catch (err) {
    console.error("getMyMatches Error:", err);
    return [];
  }
};

export const getMatchStats = async (userId) => {
  const totalMatches = await Match.countDocuments({ users: userId });
  const mutualMatches = await Match.countDocuments({ users: userId, status: "matched" });
  const privateRooms = await Room.countDocuments({ members: userId, isGroup: false });

  return {
      userId,
      totalMatches,
      mutualMatches,
      privateRooms,
      message: "If these counts are zero, no matches exist in the database for this user."
  };
};

export const processLike = async (myId, targetUserId) => {
  try {
    let match = await Match.findOne({
      users: { $all: [myId, targetUserId] }
    });

    if (!match) {
      match = await Match.create({
        users: [myId, targetUserId],
        likes: [myId],
        status: "pending"
      });
      return { message: "Interest sent!", status: "pending" };
    }

    if (match.likes.some(id => id && id.toString() === myId.toString())) {
      return { message: "You already liked this user.", status: match.status };
    }

    match.likes.push(myId);
    match.status = "matched";
    await match.save();

    // Create the private 1-on-1 chat room if matched
    const newRoom = await Room.create({
      name: "Private Chat",
      members: [myId, targetUserId],
      isGroup: false,
      status: "active"
    });

    // Notify the other user about the match
    await notificationService.createNotification({
      recipientId: targetUserId,
      senderId: myId,
      type: "new_match",
      message: "matched with you! You can now start chatting."
    });

    return { 
      message: "It's a Match!", 
      status: "matched", 
      room: newRoom 
    };
  } catch (err) {
    console.error("Error in processLike:", err);
    // Safe fallback to prevent 500
    return { message: "Error processing like", status: "error" };
  }
};
