import Profile from "../models/profileModel.js";
import User from "../models/userModel.js";

// Helper function to safely handle Decimal128 conversion
const formatCredit = (credit) => {
  if (!credit) return 0;
  return typeof credit === "object" && credit.toString 
    ? parseFloat(credit.toString()) 
    : parseFloat(credit) || 0;
};

// -------------------------------
// GET PROFILE
// -------------------------------
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("name email profilePic");
    if (!user) return res.status(404).json({ message: "User not found" });

    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      profile = await Profile.create({ user: userId });
    }

    res.json({
      name: user.name,
      email: user.email,
      profilePic: user.profilePic ? `http://localhost:5000${user.profilePic}` : "",
      dob: profile.dob || "",
      mobile: profile.mobile || "",
      interestedAreas: profile.interestedAreas || [],
      // ✅ FIXED: Convert Decimal128 to Number
      credit: formatCredit(profile.credit),
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------------------
// UPDATE PROFILE
// -------------------------------
export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    let { name, email, dob, mobile, interestedAreas, credit } = req.body;

    if (typeof interestedAreas === "string") {
      try {
        interestedAreas = JSON.parse(interestedAreas);
      } catch {
        interestedAreas = [interestedAreas];
      }
    }
    if (!Array.isArray(interestedAreas)) {
      interestedAreas = [];
    }

    const updateUserData = { name, email };
    if (req.file) {
      updateUserData.profilePic = "/uploads/" + req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateUserData, { new: true });

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { dob, mobile, interestedAreas, credit },
      { new: true, upsert: true }
    );

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
      profile: {
        ...updatedProfile._doc,
        // ✅ FIXED: Convert Decimal128 to Number in response
        credit: formatCredit(updatedProfile.credit),
      },
    });

  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// -------------------------------
// GET ALL PROFILES (For Dashboard)
// -------------------------------
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate("user", "name email profilePic")
      .sort({ createdAt: -1 });

    const formattedProfiles = profiles.map((p) => {
      if (!p.user) return null;

      return {
        profileId: p._id,
        userId: p.user._id,
        name: p.user.name,
        email: p.user.email,
        profilePic: p.user.profilePic ? `http://localhost:5000${p.user.profilePic}` : "",
        dob: p.dob || "",
        mobile: p.mobile || "",
        interestedAreas: p.interestedAreas || [],
        // ✅ FIXED: Convert Decimal128 to Number
        credit: formatCredit(p.credit),
      };
    }).filter(p => p !== null);

    res.json(formattedProfiles);
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard profiles", error: err.message });
  }
};