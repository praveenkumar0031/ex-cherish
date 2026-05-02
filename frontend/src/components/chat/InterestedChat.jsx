import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");

const InterestChat = ({ roomId, roomName }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    if (roomId) {
      // 1. Join the specific interest room
      socket.emit("join_room", roomId);

      // 2. Load existing room messages
      const fetchRoomMessages = async () => {
        try {
          const res = await axios.get(`/api/messages/room/${roomId}`);
          setMessages(res.data);
        } catch (err) {
          console.error("Error fetching room messages", err);
        }
      };
      fetchRoomMessages();
    }

    // 3. Listen for new messages in the room
    socket.on("receive_message", (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => socket.off("receive_message");
  }, [roomId]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msgData = {
      room: roomId,
      sender: user.id,
      text: message,
    };

    // Socket.io handles saving to DB and broadcasting in your server.js
    socket.emit("send_message", msgData);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full w-full border rounded-lg bg-gray-50">
      <div className="p-4 bg-indigo-600 text-white rounded-t-lg">
        <h3 className="font-bold"># {roomName}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.sender?._id === user.id ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-500 mb-1">{msg.sender?.name || "User"}</span>
            <div className={`p-3 rounded-2xl max-w-[80%] ${
              msg.sender?._id === user.id ? 'bg-indigo-500 text-white rounded-tr-none' : 'bg-white border rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white flex gap-2">
        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Message #${roomName}`}
          className="flex-1 p-2 border rounded-full px-4 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium">
          Send
        </button>
      </form>
    </div>
  );
};

export default InterestChat;