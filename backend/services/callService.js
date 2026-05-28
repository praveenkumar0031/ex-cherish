import Call from "../models/Call.js";
import * as notificationService from "./notificationService.js";
import Match from "../models/Match.js";
import mongoose from "mongoose";

export const createInstantCall = async (callerId, receiverId) => {
  if (!mongoose.Types.ObjectId.isValid(callerId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
    const error = new Error("Invalid User ID format");
    error.statusCode = 400;
    throw error;
  }

  // Validate match - Ensure they are mutually matched
  const match = await Match.findOne({
    users: { $all: [callerId, receiverId] },
    status: "matched"
  });

  if (!match) {
    const error = new Error("You can only call users you are mutually matched with.");
    error.statusCode = 403;
    throw error;
  }

  const roomId = new mongoose.Types.ObjectId().toString();
  
  const call = await Call.create({
    caller: callerId,
    receiver: receiverId,
    callType: "instant",
    roomId,
    status: "ringing",
    startedAt: new Date()
  });

  return call;
};

export const createScheduledCall = async (callerId, receiverId, scheduledFor) => {
  if (!mongoose.Types.ObjectId.isValid(callerId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
    const error = new Error("Invalid User ID format");
    error.statusCode = 400;
    throw error;
  }

  const match = await Match.findOne({
    users: { $all: [callerId, receiverId] },
    status: "matched"
  });

  if (!match) {
    const error = new Error("You can only schedule calls with users you are mutually matched with.");
    error.statusCode = 403;
    throw error;
  }

  const roomId = new mongoose.Types.ObjectId().toString();

  const call = await Call.create({
    caller: callerId,
    receiver: receiverId,
    callType: "scheduled",
    roomId,
    scheduledFor,
    status: "scheduled"
  });

  const notification = await notificationService.createNotification({
    recipientId: receiverId,
    senderId: callerId,
    type: "call_scheduled",
    relatedCall: call._id,
    message: "invited you to a scheduled video call."
  });

  return { call, notification };
};

export const updateCallStatus = async (userId, callId, status) => {
  const call = await Call.findById(callId);
  if (!call) throw new Error("Call not found");

  call.status = status;

  if (status === "completed" || status === "rejected" || status === "missed") {
    call.endedAt = new Date();
    if (call.startedAt) {
        call.duration = Math.round((call.endedAt - call.startedAt) / 1000);
    }
  }

  await call.save();

  // Notify about accept/reject for scheduled calls
  let notif = null;
  if (call.callType === "scheduled" && (status === "accepted" || status === "rejected")) {
      const notificationType = status === "accepted" ? "call_accepted" : "call_rejected";
      notif = await notificationService.createNotification({
        recipientId: call.caller,
        senderId: userId,
        type: notificationType,
        relatedCall: call._id,
        message: `${status} your video call invitation.`
      });
  }

  return { call, notification: notif };
};

export const sendCallReminder = async (userId, callId) => {
    const call = await Call.findById(callId).populate("caller receiver");
    if (!call) throw new Error("Call not found");

    const isCaller = call.caller._id.toString() === userId.toString();
    const recipientId = isCaller ? call.receiver._id : call.caller._id;
    const senderId = userId;

    const notification = await notificationService.createNotification({
        recipientId,
        senderId,
        type: "call_reminder",
        relatedCall: call._id,
        message: "sent you a reminder for your upcoming video call."
    });

    return notification;
};

export const getUserCalls = async (userId) => {
  return await Call.find({
    $or: [{ caller: userId }, { receiver: userId }]
  })
    .populate("caller", "name profilePic")
    .populate("receiver", "name profilePic")
    .sort({ createdAt: -1 });
};

export const getCallById = async (callId) => {
    return await Call.findById(callId)
      .populate("caller", "name profilePic")
      .populate("receiver", "name profilePic");
};

export const getCallByRoomId = async (roomId) => {
    return await Call.findOne({ roomId })
      .populate("caller", "name profilePic")
      .populate("receiver", "name profilePic");
};
