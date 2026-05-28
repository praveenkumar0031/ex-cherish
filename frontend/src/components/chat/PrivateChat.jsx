import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import API from '../../services/api';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import ChatLayout from './ChatLayout';
import ConversationList from './ConversationList';
import ScheduleCallModal from './ScheduleCallModal';
import { Phone, Video, Info, Circle, Calendar, ShieldCheck, Clock, MoreVertical, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PrivateChat = () => {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  // Fetch Receiver info and Messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, msgRes] = await Promise.all([
          API.get(`users/${receiverId}`),
          API.get(`messages/private?sender=${user.id || user._id}&receiver=${receiverId}`)
        ]);
        setReceiver(userRes.data);
        setChatHistory(msgRes.data || []);
      } catch (err) {
        console.error("Error fetching chat data", err);
      } finally {
        setLoading(false);
      }
    };
    if (receiverId) fetchData();
  }, [receiverId, user]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    if (receiverId) {
        socket.emit("mark_read", { 
            senderId: receiverId, 
            receiverId: user.id || user._id 
        });
    }

    socket.on("receiveMessage", (data) => {
      if (data.senderId === receiverId || data.senderId === (user.id || user._id)) {
        setChatHistory((prev) => [...prev, data]);
      }
    });

    socket.on("user_typing", (data) => {
      if (data.senderId === receiverId) {
        setOtherUserTyping(data.isTyping);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("user_typing");
    };
  }, [socket, receiverId, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const messageData = {
      senderId: user.id || user._id,
      receiver: receiverId,
      text: message,
      senderName: user.name
    };

    socket.emit("sendMessage", messageData);
    socket.emit("typing", { receiverId, senderId: user.id || user._id, isTyping: false });
    setMessage("");
  };

  const handleTyping = (val) => {
    setMessage(val);
    if (!socket) return;

    if (!isTyping && val.length > 0) {
      setIsTyping(true);
      socket.emit("typing", { receiverId, senderId: user.id || user._id, isTyping: true });
    } else if (isTyping && val.length === 0) {
      setIsTyping(false);
      socket.emit("typing", { receiverId, senderId: user.id || user._id, isTyping: false });
    }
  };

  const handleStartCall = async () => {
      try {
          const res = await API.post("calls/create", { receiverId });
          navigate(`/call/${res.data.roomId}?initiator=true&receiverId=${receiverId}`);
      } catch(err) {
          console.error("Failed to start call", err);
          alert(err.response?.data?.message || "Failed to start video call");
      }
  };

  const chatContent = (
    <div className="flex flex-col h-full relative overflow-hidden bg-slate-50/50">
      
      {/* Header */}
      <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white/70 backdrop-blur-xl sticky top-0 z-20 shadow-sm shadow-slate-900/5">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => navigate("/profile")}>
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-100 transition-transform group-hover:scale-105">
                {receiver?.profilePic ? (
                <img src={receiver.profilePic} className="w-full h-full object-cover" alt="" />
                ) : (
                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600 font-[900] text-xl">
                    {receiver?.name?.charAt(0) || "?"}
                </div>
                )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-4 border-white rounded-full shadow-sm" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
                <h3 className="font-[900] text-slate-900 leading-tight truncate max-w-[150px] md:max-w-none">{receiver?.name || "Initializing..."}</h3>
                <ShieldCheck size={14} className="text-blue-500 flex-shrink-0" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest mt-0.5">
              {otherUserTyping ? (
                <span className="text-blue-600 animate-pulse italic">Receiving Packets...</span>
              ) : (
                <span className="text-slate-400">Secure Uplink Established</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
            <button 
                onClick={() => setShowScheduleModal(true)}
                className="p-2.5 bg-white text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-blue-50 active:scale-95"
                title="Schedule Session"
            >
                <Calendar size={18} strokeWidth={2.5} />
            </button>
            <button 
                onClick={handleStartCall}
                className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95"
                title="Instant Video Uplink"
            >
                <Video size={18} strokeWidth={2.5} />
            </button>
          </div>
          <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />
          <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><Info size={20} /></button>
          <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><MoreVertical size={20} /></button>
        </div>
      </header>

      <ScheduleCallModal 
        isOpen={showScheduleModal} 
        onClose={() => setShowScheduleModal(false)} 
        receiverId={receiverId}
        receiverName={receiver?.name}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4 scrollbar-hide relative">
        <div className="flex flex-col items-center py-12 text-center mb-10">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/5 border border-slate-50 flex items-center justify-center mb-6 relative overflow-hidden ring-4 ring-slate-50"
           >
             {receiver?.profilePic ? (
                <img src={receiver.profilePic} className="w-full h-full object-cover scale-110" alt="" />
              ) : (
                <div className="text-4xl font-black text-blue-600">{receiver?.name?.charAt(0)}</div>
              )}
           </motion.div>
           <h4 className="font-[900] text-slate-900 text-2xl tracking-tight mb-2 uppercase italic">{receiver?.name}</h4>
           <div className="flex items-center gap-3 bg-blue-50/50 px-5 py-2 rounded-full border border-blue-100/50">
                <ShieldCheck size={14} className="text-blue-500" />
                <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest">End-to-End Encrypted Tunnel</p>
           </div>
           <p className="text-slate-400 text-xs font-medium max-w-xs mt-6 leading-relaxed">System node established. All transmissions in this cluster are synchronized and logged under collective protocols.</p>
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
                        senderName={isMe ? user.name : (msg.sender?.name || receiver?.name)}
                        senderPic={isMe ? user.profilePic : (msg.sender?.profilePic || receiver?.profilePic)}
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
            onChange={handleTyping} 
            onSend={handleSend} 
            placeholder={`Transmit to @${receiver?.name?.split(' ')[0] || 'Node'}...`} 
          />
          <div className="mt-4 flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Standard Port</span>
              </div>
              <div className="flex items-center gap-2">
                  <Clock size={10} className="text-slate-300" />
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Uptime 99.9%</span>
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

export default PrivateChat;
