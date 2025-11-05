import Profile from "../models/profileModel.js";
import User from "../models/userModel.js";

// ✅ Get profile for a user
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    let profile = await Profile.findOne({ user: userId });
    if (!profile) {
      // create empty profile for new user
      profile = await Profile.create({ user: userId });
    }

    res.json({
      name: user.name,
      email: user.email,
      dob: profile.dob || "",
      mobile: profile.mobile || "",
      interestedAreas: profile.interestedAreas || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update or create profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { dob, mobile, interestedAreas } = req.body;

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { dob, mobile, interestedAreas },
      { new: true, upsert: true }
    );

    res.json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
