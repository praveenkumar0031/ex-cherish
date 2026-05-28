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

export const createNotification = async (data) => {
  const notification = await Notification.create({
    recipient: data.recipientId,
    sender: data.senderId,
    type: data.type,
    message: data.message,
    relatedCall: data.relatedCall,
  });
  return await notification.populate("sender", "name profilePic");
};
