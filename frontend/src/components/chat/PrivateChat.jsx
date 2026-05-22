// frontend/src/components/match/PrivateChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; // Add this
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext'; 
import axios from 'axios';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

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

    const handleReceiveMessage = (data) => {
      // Only add message if it's from the person we are currently chatting with
      if (data.senderId === receiverId || data.senderId === user.id) {
        setChatHistory((prev) => [...prev, data]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [receiverId, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = async () => {
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
    <div className="flex flex-col h-[700px] w-full max-w-3xl mx-auto border border-gray-100 rounded-3xl bg-white shadow-2xl overflow-hidden mt-6">
      <div className="px-6 py-5 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Direct Session</h3>
          <p className="text-xs text-blue-100 opacity-80">Encrypted and private</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-1 bg-gray-50/50">
        {chatHistory.map((msg, index) => {
          const isMe = msg.senderId === user.id || msg.sender?._id === user.id;
          return (
            <MessageBubble 
              key={index} 
              message={msg.text} 
              isMe={isMe} 
              timestamp={msg.createdAt} 
            />
          );
        })}
        <div ref={scrollRef} />
      </div>

      <ChatInput 
        value={message} 
        onChange={setMessage} 
        onSend={handleSend} 
        placeholder="Securely send a message..." 
      />
    </div>
  );
};

export default PrivateChat;