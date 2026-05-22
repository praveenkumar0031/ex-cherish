import Meeting from "../models/Meeting.js";
import crypto from "crypto";

export const createMeeting = async (req, res) => {
  try {
    const { title } = req.body;
    const meetingId = crypto.randomBytes(4).toString("hex"); // e.g., 'a1b2c3d4'

    const newMeeting = new Meeting({
      meetingId,
      title: title || "New Meeting",
      hostId: req.user._id,
      status: "active",
    });

    await newMeeting.save();
    res.status(201).json(newMeeting);
  } catch (error) {
    res.status(500).json({ message: "Error creating meeting", error: error.message });
  }
};

export const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findOne({ meetingId, status: "active" });

    if (!meeting) {
      return res.status(404).json({ message: "Active meeting not found" });
    }

    res.status(200).json({ message: "Successfully joined meeting", meeting });
  } catch (error) {
    res.status(500).json({ message: "Error joining meeting", error: error.message });
  }
};
