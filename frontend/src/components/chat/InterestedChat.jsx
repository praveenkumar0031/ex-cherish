import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// Initialize socket outside or wrap in useMemo to prevent multiple connections
const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");

const InterestChat = ({ roomId, roomName }) => {
  const { user, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  // 1. Join Room and Listen for Messages
  useEffect(() => {
    if (!roomId || !user) return;

    // Join the specific socket room
    socket.emit("join_room", roomId);

    // Listen for incoming messages
    const handleReceiveMessage = (data) => {
      // Only append if the message belongs to the current active room
      if (data.room === roomId) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    // Cleanup: stop listening and leave room when component unmounts or roomId changes
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.emit("leave_room", roomId);
    };
  }, [roomId, user]);

  // 2. Fetch Message History
  useEffect(() => {
    const fetchRoomMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/messages/room/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching room messages:", err.response?.data || err.message);
      }
    };

    if (roomId) {
      fetchRoomMessages();
    }
  }, [roomId]);

  // 3. Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) return <div className="p-4 text-center">Synchronizing session...</div>;
  if (!user) return <div className="p-4 text-center text-red-500">Please log in to join the chat.</div>;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msgData = {
      room: roomId,
      sender: {
        _id: user.id || user._id, // Ensure we use the right ID field
        name: user.name
      },
      text: message,
    };

    // Emit to socket (this triggers real-time update for everyone in the room)
    socket.emit("send_message", msgData);
    
    // Clear input
    setMessage("");

    // Optional: Save to DB via axios if your server.js doesn't handle DB saving on "send_message"
    try {
        const token = localStorage.getItem("token");
        await axios.post("http://localhost:5000/api/messages/send", {
            roomId: roomId,
            text: message
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (err) {
        console.error("Failed to save message to DB", err);
    }
  };

  return (
    <div className="flex flex-col h-full w-full border rounded-lg bg-gray-50 overflow-hidden">
      <div className="p-4 bg-indigo-600 text-white shadow-md">
        <h3 className="font-bold flex items-center gap-2">
          <span className="opacity-70 text-xl">#</span> {roomName}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5e7eb]/30">
        {messages.map((msg, index) => {
          // Identify if the message is from the logged-in user
          const isMe = (msg.sender?._id || msg.sender) === (user.id || user._id);
          
          return (
            <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] font-semibold text-gray-500 mb-1 px-2 uppercase tracking-wide">
                {isMe ? "You" : (msg.sender?.name || "User")}
              </span>
              <div className={`p-3 rounded-2xl shadow-sm max-w-[75%] ${
                isMe 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Message #${roomName}`}
          className="flex-1 p-2.5 border border-gray-300 rounded-xl px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold transition-colors">
          Send
        </button>
      </form>
    </div>
  );
};

export default InterestChat;