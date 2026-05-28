import Profile from "../models/Profile.js";
import User from "../models/User.js";

const formatCredit = (credit) => {
  if (!credit) return 0;
  return typeof credit === "object" && credit.toString 
    ? parseFloat(credit.toString()) 
    : parseFloat(credit) || 0;
};

export const fetchProfile = async (userId) => {
  const user = await User.findById(userId).select("name email profilePic");
  if (!user) throw new Error("User not found");

  let profile = await Profile.findOne({ user: userId });
  if (!profile) {
    profile = await Profile.create({ user: userId });
  }

  return {
    name: user.name,
    email: user.email,
    profilePic: user.profilePic ? `http://localhost:5000${user.profilePic}` : "",
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
  let { name, email, dob, mobile, bio, tags, categories, interestedAreas, credit } = updateData;

  const parseArray = (val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [val];
      }
    }
    return Array.isArray(val) ? val : [];
  };

  interestedAreas = parseArray(interestedAreas);
  tags = parseArray(tags);
  categories = parseArray(categories);

  const updateUserData = { name, email };
  if (file) {
    updateUserData.profilePic = "/uploads/" + file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateUserData, { new: true });
  const updatedProfile = await Profile.findOneAndUpdate(
    { user: userId },
    { dob, mobile, bio, tags, categories, interestedAreas, credit },
    { new: true, upsert: true }
  );

  return {
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic ? `http://localhost:5000${updatedUser.profilePic}` : "",
    },
    profile: {
      ...updatedProfile._doc,
      credit: formatCredit(updatedProfile.credit),
    },
  };
};

export const fetchAllProfiles = async () => {
  const profiles = await Profile.find()
    .populate("user", "name email profilePic")
    .sort({ createdAt: -1 });

  return profiles.map((p) => {
    if (!p.user) return null;

    return {
      profileId: p._id,
      userId: p.user._id,
      name: p.user.name,
      email: p.user.email,
      profilePic: p.user.profilePic ? `http://localhost:5000${p.user.profilePic}` : "",
      dob: p.dob || "",
      mobile: p.mobile || "",
      bio: p.bio || "",
      tags: p.tags || [],
      categories: p.categories || [],
      interestedAreas: p.interestedAreas || [],
      credit: formatCredit(p.credit),
    };
  }).filter(p => p !== null);
};
