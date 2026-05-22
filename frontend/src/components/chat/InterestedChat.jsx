import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import API from '../../services/api';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import ChatLayout from './ChatLayout';
import ConversationList from './ConversationList';
import { Hash, Settings, Users, Info } from 'lucide-react';

const InterestChat = () => {
  const { roomId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const socket = useSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState(null);
  const scrollRef = useRef();

  // 1. Fetch Room Info and Message History
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const [roomRes, msgRes] = await Promise.all([
          API.get("rooms"), // Need a specific room fetch, but for now we find in list
          API.get(`messages/room/${roomId}`)
        ]);
        
        // Find specific room in the list for now
        const currentRoom = roomRes.data.find(r => r._id === roomId);
        setRoom(currentRoom);
        setMessages(msgRes.data);
      } catch (err) {
        console.error("Error fetching room data:", err);
      }
    };

    if (roomId) fetchRoomData();
  }, [roomId]);

  // 2. Socket listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit("join_room", roomId);

    const handleReceiveMessage = (data) => {
      if (data.roomId === roomId || data.room === roomId) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("receive_message", handleReceiveMessage); // Backward compatibility

    return () => {
      socket.off("receiveMessage");
      socket.off("receive_message");
    };
  }, [socket, roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (authLoading) return <div className="p-8 text-center text-gray-500 font-medium">Authenticating...</div>;
  if (!user) return <div className="p-8 text-center text-red-500 font-medium">Unauthorized access</div>;

  const handleSend = async () => {
    if (!message.trim()) return;

    const msgData = {
      roomId: roomId,
      senderId: user.id || user._id,
      senderName: user.name,
      text: message,
    };

    socket.emit("sendMessage", msgData);
    setMessage("");
  };

  const chatContent = (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Hash size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">{room?.name || "Group Chat"}</h3>
            <p className="text-xs text-gray-500 font-medium">{room?.topic || "Discussion group"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <button className="hover:text-indigo-600 transition-colors flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-md hover:bg-gray-50">
            <Users size={18} /> {room?.members?.length || 0}
          </button>
          <button className="hover:text-indigo-600 transition-colors"><Settings size={18} /></button>
          <button className="hover:text-indigo-600 transition-colors"><Info size={18} /></button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#f8fafc]">
        {messages.map((msg, index) => {
          const isMe = (msg.sender?._id || msg.senderId || msg.sender) === (user.id || user._id);
          return (
            <MessageBubble 
              key={index} 
              message={msg.text} 
              isMe={isMe} 
              timestamp={msg.createdAt}
              senderName={msg.sender?.name || msg.senderName || "User"}
              senderPic={msg.sender?.profilePic || null}
            />
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <ChatInput 
        value={message} 
        onChange={setMessage} 
        onSend={handleSend} 
        placeholder={`Message #${room?.name || 'group'}`} 
      />
    </div>
  );

  return (
    <ChatLayout sidebar={<ConversationList user={user} />}>
      {chatContent}
    </ChatLayout>
  );
};

export default InterestChat;
