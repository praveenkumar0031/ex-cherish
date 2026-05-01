import Profile from "../models/profileModel.js";
import Match from "../models/Match.js";
import Room from "../models/Room.js";

// ✅ 1. Discover Profiles based on Mutual Interests
export const discoverProfiles = async (req, res) => {
  try {
    // 1. Find the logged-in user's profile
    const myProfile = await Profile.findOne({ user: req.user.id });

    // 2. Build the query
    let query = { user: { $ne: req.user.id } };

    // Only filter by interests if the user actually has interests saved
    if (myProfile && myProfile.interestedAreas && myProfile.interestedAreas.length > 0) {
      query.interestedAreas = { $in: myProfile.interestedAreas };
    }

    const suggestions = await Profile.find(query)
      .populate("user", "name profilePic")
      .limit(20);

    res.json(suggestions);
  } catch (error) {
    console.error("Discovery Error:", error); // This will show you the EXACT error in your terminal
    res.status(500).json({ message: "Server error during discovery", error: error.message });
  }
};
export const likeProfile = async (req, res) => {
  const myId = req.user.id;
  const targetUserId = req.params.userId;

  try {
    // 1. Check if a match record already exists between these two users
    let match = await Match.findOne({
      users: { $all: [myId, targetUserId] }
    });

    // 2. If NO record exists, this is the FIRST person to show interest
    if (!match) {
      match = await Match.create({
        users: [myId, targetUserId],
        likes: [myId],
        status: "pending"
      });
      return res.json({ message: "Interest sent!", status: "pending" });
    }

    // 3. If a record EXISTS but you already liked them, just return
    if (match.likes.includes(myId)) {
      return res.status(400).json({ message: "You already liked this user." });
    }

    // 4. THE MUTUAL MATCH LOGIC (Put your code here)
    // This runs if 'match' exists and 'myId' is NOT in 'likes' (meaning the other person liked you first)
    match.likes.push(myId);
    match.status = "matched";
    await match.save();

    // Create the private 1-on-1 chat room
    const newRoom = await Room.create({
      name: "Private Chat",
      members: [myId, targetUserId],
      isGroup: false, // Important: distinguishes from skill-exchange groups
      status: "active"
    });

    // Return the room info so the frontend can navigate(`/chat/${room._id}`)
    return res.json({ 
      message: "It's a Match!", 
      status: "matched", 
      room: newRoom 
    });

  } catch (error) {
    console.error("Like Profile Error:", error);
    res.status(500).json({ message: "Server error during matching" });
  }
};