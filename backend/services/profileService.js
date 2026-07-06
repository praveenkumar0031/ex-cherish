import Profile from "../models/Profile.js";
import User from "../models/User.js";

// BUG FIX: 'http://localhost:5000' was hardcoded in 3 places — breaks in production on Render
// Now uses BACKEND_URL env variable with a safe localhost fallback for dev
const getBackendUrl = () =>
  process.env.BACKEND_URL || "http://localhost:5000";

const buildProfilePicUrl = (picPath) => {
  if (!picPath) return "";
  if (picPath.startsWith("http")) return picPath; // already full URL (e.g. Cloudinary)
  return `${getBackendUrl()}${picPath}`; // local upload path
};

const formatCredit = (credit) => {
  if (!credit) return 0;
  return typeof credit === "object" && credit.toString
    ? parseFloat(credit.toString())
    : parseFloat(credit) || 0;
};

export const fetchProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  let profile = await Profile.findOne({ user: userId });
  if (!profile) {
    profile = await Profile.create({ user: userId });
  }

  return {
    _id: user._id,
    name: user.name,
    username: user.username || "",
    email: user.email,
    profilePic: buildProfilePicUrl(user.profilePic),
    role: user.role,
    isVerified: user.isVerified,
    lastSeen: user.lastSeen,
    dob: profile.dob || "",
    mobile: profile.mobile || "",
    bio: profile.bio || "",
    tags: profile.tags || [],
    categories: profile.categories || [],
    interestedAreas: profile.interestedAreas || [],
    credit: formatCredit(profile.credit),
  };
};

export const modifyProfile = async (userId, updateData, file) => {
  let { name, email, dob, mobile, bio, tags, categories, interestedAreas, credit } =
    updateData;

  const parseArray = (val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    return Array.isArray(val) ? val : [];
  };

  interestedAreas = parseArray(interestedAreas);
  tags = parseArray(tags);
  categories = parseArray(categories);

  const updateUserData = {};
  if (name) updateUserData.name = name.trim();
  if (email) updateUserData.email = email.toLowerCase().trim();
  if (file) {
    updateUserData.profilePic = "/uploads/" + file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateUserData, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!updatedUser) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  // BUG FIX: Was using ._doc (Mongoose internal) — replaced with .toObject()
  const updatedProfile = await Profile.findOneAndUpdate(
    { user: userId },
    { dob, mobile, bio, tags, categories, interestedAreas, credit },
    { new: true, upsert: true, runValidators: true }
  );

  return {
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username || "",
      email: updatedUser.email,
      profilePic: buildProfilePicUrl(updatedUser.profilePic),
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
    },
    profile: {
      ...updatedProfile.toObject(), // BUG FIX: was ._doc
      credit: formatCredit(updatedProfile.credit),
    },
  };
};

export const fetchAllProfiles = async () => {
  const profiles = await Profile.find()
    .populate("user", "name email profilePic username role isVerified lastSeen")
    .sort({ createdAt: -1 });

  return profiles
    .map((p) => {
      if (!p.user) return null;

      return {
        profileId: p._id,
        userId: p.user._id,
        name: p.user.name,
        username: p.user.username || "",
        email: p.user.email,
        profilePic: buildProfilePicUrl(p.user.profilePic),
        role: p.user.role,
        isVerified: p.user.isVerified,
        lastSeen: p.user.lastSeen,
        dob: p.dob || "",
        mobile: p.mobile || "",
        bio: p.bio || "",
        tags: p.tags || [],
        categories: p.categories || [],
        interestedAreas: p.interestedAreas || [],
        credit: formatCredit(p.credit),
      };
    })
    .filter((p) => p !== null);
};
