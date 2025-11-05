import Message from "../models/messageModel.js";

// ✅ Send a message
export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    if (!sender || !receiver || !text) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const message = await Message.create({ sender, receiver, text });
    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Server error while sending message" });
  }
};

// ✅ Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.query; // ✅ safer for frontend URL queries

    if (!sender || !receiver) {
      return res.status(400).json({ error: "Sender and receiver required." });
    }

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 }); // sort messages oldest to newest

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error while fetching messages" });
  }
};
