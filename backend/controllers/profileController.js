import Profile from "../models/profileModel.js";
import User from "../models/userModel.js";

// -------------------------------
// GET PROFILE
// -------------------------------
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select("name email profilePic");
    if (!user) return res.status(404).json({ message: "User not found" });

    let profile = await Profile.findOne({ user: userId });

    // Create new profile if not exists
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
      credit: profile.credit || 0,
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

    // -------------------------------
    // FIX ARRAY ISSUE
    // -------------------------------
    if (typeof interestedAreas === "string") {
      try {
        interestedAreas = JSON.parse(interestedAreas); // When frontend sends JSON
      } catch {
        interestedAreas = [interestedAreas]; // Single string
      }
    }
    if (!Array.isArray(interestedAreas)) {
      interestedAreas = [];
    }

    // -------------------------------
    // UPDATE USER TABLE
    //-------------------------------
    const updateUserData = { name, email };

    if (req.file) {
      updateUserData.profilePic = "/uploads/" + req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateUserData,
      { new: true }
    );

    // -------------------------------
    // UPDATE PROFILE TABLE
    //-------------------------------
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { dob, mobile, interestedAreas, credit },
      { new: true, upsert: true }
    );

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
      profile: updatedProfile,
    });

  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ message: err.message });
  }
};
