// frontend/src/components/match/PrivateChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; // Add this
import io from 'socket.io-client';
import { useAuth } from '../../context/Authcontext'; 
import axios from 'axios';

const socket = io("http://localhost:5000");

const PrivateChat = () => {
  const { receiverId } = useParams(); // Get ID from URL /private-chat/:receiverId
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    if (user?.id) {
      socket.emit("join", user.id); 
    }

    const fetchMessages = async () => {
      try {
        // Correct endpoint based on our route fix
        const res = await axios.get(`http://localhost:5000/api/messages/private?sender=${user.id}&receiver=${receiverId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setChatHistory(res.data);
      } catch (err) {
        console.error("Error fetching chat history", err);
      }
    };

    fetchMessages();

    socket.on("receiveMessage", (data) => {
      // Only add message if it's from the person we are currently chatting with
      if (data.senderId === receiverId || data.senderId === user.id) {
        setChatHistory((prev) => [...prev, data]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [receiverId, user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageData = {
      senderId: user.id,
      receiver: receiverId, 
      text: message,
      senderName: user.name
    };

    socket.emit("sendMessage", messageData);

    try {
      await axios.post("http://localhost:5000/api/messages/send", {
        text: message,
        receiverId: receiverId 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setMessage("");
    } catch (err) {
      console.error("Failed to save message", err);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border rounded-lg bg-white shadow-xl">
      <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <h3 className="font-bold">Chat Session</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.senderId === user.id || msg.sender?._id === user.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${msg.senderId === user.id || msg.sender?._id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-md outline-none focus:border-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Send</button>
      </form>
    </div>
  );
};

export default PrivateChat;