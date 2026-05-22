import asyncHandler from "express-async-handler";
import * as notificationService from "../services/notificationService.js";
import Notification from "../models/Notification.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getNotifications(req.user.id);
  res.json(notifications);
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.user.id,
    req.params.id
  );

  res.json(notification);
});

export const clearAll = asyncHandler(async (req, res) => {
  await notificationService.clearNotifications(req.user.id);

  res.json({
    message: "Notifications cleared",
  });
});

export const createNotification = asyncHandler(async (req, res) => {
  const { recipientId, type, message, relatedCall } = req.body;

  const notification = await Notification.create({
    recipient: recipientId,
    sender: req.user.id,
    type,
    message,
    relatedCall,
  });

  res.status(201).json(notification);
});