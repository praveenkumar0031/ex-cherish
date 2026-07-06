import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate short-lived access token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// BUG FIX: register() previously returned a flat object { _id, name, email, token }
// while login() returned nested { token, user: { ... } }
// Frontend was coded for login's shape. Now BOTH return the same shape: { token, user }
export const register = async (userData) => {
  const { name, email, password } = userData;

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    // BUG FIX: Use a proper status error so errorHandler returns 400, not 500
    const err = new Error("All fields are required");
    err.statusCode = 400;
    throw err;
  }

  const userExists = await User.findOne({ email: email.toLowerCase().trim() });
  if (userExists) {
    const err = new Error("An account with this email already exists");
    err.statusCode = 409; // Conflict
    throw err;
  }

  // Generate a unique username from name (fallback)
  const baseUsername = name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 9999);

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.trim(),
    username: baseUsername,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
  });

  if (!user) {
    const err = new Error("Failed to create account, please try again");
    err.statusCode = 500;
    throw err;
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic || null,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};

export const login = async (email, password) => {
  if (!email?.trim() || !password?.trim()) {
    const err = new Error("Email and password are required");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error("This account has been suspended. Contact support.");
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  // Update lastSeen on login
  user.lastSeen = new Date();
  await user.save();

  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic || null,
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};
