import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatRoom = ({ roomId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // 1. Fetch Chat History
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/messages/${roomId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages");
      }
    };
    fetchMessages();
  }, [roomId]);

  // 2. Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(`/api/messages/${roomId}`, { text: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      alert("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border rounded-lg bg-white shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 font-bold text-lg text-gray-700">
        Chat Room
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg._id} 
            className={`flex ${msg.sender._id === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
              msg.sender._id === currentUser.id 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-200 text-gray-800 rounded-tl-none'
            }`}>
              <p className="text-sm font-bold mb-1">{msg.sender.name}</p>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;