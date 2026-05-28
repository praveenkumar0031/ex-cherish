import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import API from '../../services/api';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import ChatLayout from './ChatLayout';
import ConversationList from './ConversationList';
import { Info, Users, Hash, ShieldCheck, Activity, Globe, MoreVertical, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InterestChat = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Find room in my chats (we don't have a direct room GET for now based on previous code)
        const [roomRes, msgRes] = await Promise.all([
          API.get(`chat/my-chats`),
          API.get(`messages/room/${roomId}`)
        ]);
        
        const currentRoom = roomRes.data.find(r => r._id === roomId);
        setRoom(currentRoom);
        setChatHistory(msgRes.data || []);
      } catch (err) {
        console.error("Error fetching interest chat data", err);
      } finally {
        setLoading(false);
      }
    };
    if (roomId) fetchData();
  }, [roomId]);

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit("join_room", roomId);

    socket.on("receiveMessage", (data) => {
      if (data.roomId === roomId) {
        setChatHistory((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket, roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

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
    <div className="flex flex-col h-full relative overflow-hidden bg-slate-50/50">
      
      {/* Header */}
      <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white/70 backdrop-blur-xl sticky top-0 z-20 shadow-sm shadow-slate-900/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
            <Hash size={24} strokeWidth={3} />
          </div>
          <div className="min-w-0">
            <h3 className="font-[900] text-slate-900 leading-tight truncate max-w-[200px] md:max-w-none">{room?.name || "Distributed Node"}</h3>
            <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg">
                    <Users size={10} strokeWidth={3} /> {room?.members?.length || 0}
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{room?.topic || "Public Grid"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-4 px-6 py-2 bg-slate-50 rounded-2xl border border-slate-100 mr-4">
              <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
                  <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Grid Online</span>
              </div>
              <div className="w-px h-3 bg-slate-200" />
              <div className="flex items-center gap-2">
                  <Globe size={12} className="text-blue-500" />
                  <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Public Access</span>
              </div>
          </div>
          <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><Info size={20} /></button>
          <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><MoreVertical size={20} /></button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4 scrollbar-hide">
        <div className="flex flex-col items-center py-16 text-center mb-10">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-28 h-28 bg-white rounded-[3rem] shadow-2xl shadow-slate-900/5 border border-slate-50 flex items-center justify-center mb-8 relative overflow-hidden ring-8 ring-slate-50"
           >
              <Hash size={48} className="text-blue-600" strokeWidth={2.5} />
           </motion.div>
           <h4 className="font-[900] text-slate-900 text-3xl tracking-tighter mb-4 uppercase italic">Cluster {room?.name}</h4>
           <div className="flex flex-wrap justify-center gap-3 mb-8">
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                    <Sparkles size={12} className="text-indigo-600" />
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Collaborative Exchange</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 px-4 py-1.5 rounded-full">
                    <Activity size={12} className="text-white" />
                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Active Stream</p>
                </div>
           </div>
           <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto leading-relaxed">Broadcast to all nodes in this sector. Information sharing protocols are active. Maintain professional knowledge transfer standards.</p>
        </div>

        <AnimatePresence initial={false}>
            {chatHistory.map((msg, index) => {
            const isMe = (msg.senderId || msg.sender?._id) === (user.id || user._id);
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg._id || index}
                >
                    <MessageBubble 
                        message={msg.text} 
                        isMe={isMe} 
                        timestamp={msg.createdAt}
                        senderName={msg.senderName || msg.sender?.name}
                        senderPic={msg.sender?.profilePic}
                    />
                </motion.div>
            );
            })}
        </AnimatePresence>
        <div ref={scrollRef} className="h-2" />
      </div>

      {/* Input */}
      <div className="p-6 md:p-8 bg-white/70 backdrop-blur-xl border-t border-slate-100">
          <ChatInput 
            value={message} 
            onChange={(val) => setMessage(val)} 
            onSend={handleSend} 
            placeholder={`Broadcast to #${room?.name || 'cluster'}...`} 
          />
          <div className="mt-4 flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Gateway: Standard-01</span>
              </div>
              <div className="flex items-center gap-2">
                  <ShieldCheck size={10} className="text-slate-300" />
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Cluster Authenticated</span>
              </div>
          </div>
      </div>
    </div>
  );

  return (
    <ChatLayout sidebar={<ConversationList user={user} />}>
      {chatContent}
    </ChatLayout>
  );
};

export default InterestChat;
