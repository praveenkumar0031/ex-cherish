import Notification from "../models/Notification.js";

export const getNotifications = async (userId) => {
  return await Notification.find({ recipient: userId })
    .populate("sender", "name profilePic")
    .sort({ createdAt: -1 })
    .limit(20);
};

export const markAsRead = async (userId, notificationId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
};

export const clearNotifications = async (userId) => {
  return await Notification.deleteMany({ recipient: userId });
};
