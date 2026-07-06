import React, { useEffect, useState, useRef } from "react";
import ChatList from "./ChatList";
import MessageInput from "./MessageInput";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

function Chat({ user }) {
  const [selectedRoom, setSelectedRoom] = useState(null); // Now stores the whole room object
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // ✅ 1. Join Socket Room based on Room ID
  useEffect(() => {
    if (selectedRoom?._id) {
      socket.emit("join_room", selectedRoom._id);
      
      // Fetch History
      const fetchMessages = async () => {
        const res = await axios.get(`/api/rooms/${selectedRoom._id}/messages`);
        setMessages(res.data);
      };
      fetchMessages();
    }
  }, [selectedRoom]);

  // ✅ 2. Listen for Real-time messages
  useEffect(() => {
    socket.on("receive_message", (message) => {
      // Only add message if it belongs to the current open room
      if (message.room === selectedRoom?._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off("receive_message");
  }, [selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ 3. Send Message
  const sendMessage = async (msgText) => {
    if (!msgText.trim() || !selectedRoom) return;

    const messageData = {
      room: selectedRoom._id,
      sender: user.id, // Or user._id
      text: msgText,
    };

    // Emit to socket for instant update for the other person
    socket.emit("send_message", messageData);
    
    // Note: Usually, your backend should save to DB on "send_message" 
    // and then broadcast to everyone in the room.
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-80 bg-white border-r p-4 flex-shrink-0">
        <ChatList 
          setSelectedRoom={setSelectedRoom} 
          selectedRoom={selectedRoom} 
          userId={user.id} 
        />
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-blue-600 text-white px-6 py-4 shadow-md">
          {selectedRoom ? (
            <div>
              <h2 className="text-lg font-semibold">Exchanging: {selectedRoom.skillOffered}</h2>
              <p className="text-xs opacity-75 italic">Room ID: {selectedRoom._id}</p>
            </div>
          ) : (
            <h2 className="text-lg font-semibold">Welcome to Excherish Chat</h2>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
          {selectedRoom ? (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender._id === user.id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2 rounded-xl shadow ${
                  msg.sender._id === user.id ? "bg-blue-600 text-white" : "bg-white text-gray-800"
                }`}>
                  <p className="text-xs font-bold mb-1">{msg.sender.name}</p>
                  {msg.text}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 mt-10">Select an exchange to view messages</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {selectedRoom && (
          <div className="bg-white p-4 border-t">
            <MessageInput onSend={sendMessage} />
          </div>
        )}
      </main>
    </div>
  );
}

export default Chat;