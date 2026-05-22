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
import { Phone, Video, Info, Circle, Calendar } from 'lucide-react';

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
  const scrollRef = useRef();

  // Fetch Receiver info and Messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, msgRes] = await Promise.all([
          API.get(`profile/${receiverId}`),
          API.get(`messages/private?sender=${user.id || user._id}&receiver=${receiverId}`)
        ]);
        setReceiver(userRes.data);
        setChatHistory(msgRes.data);
      } catch (err) {
        console.error("Error fetching chat data", err);
      }
    };
    if (receiverId) fetchData();
  }, [receiverId, user]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

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
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            {receiver?.profilePic ? (
              <img src={receiver.profilePic} className="w-10 h-10 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {receiver?.name?.charAt(0) || "U"}
              </div>
            )}
            <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">{receiver?.name || "Loading..."}</h3>
            <p className="text-xs text-gray-500 font-medium">
              {otherUserTyping ? (
                <span className="text-blue-600 animate-pulse italic">typing...</span>
              ) : (
                "Active now"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <button 
            onClick={() => setShowScheduleModal(true)}
            className="hover:text-blue-600 transition-colors"
            title="Schedule Call"
          >
            <Calendar size={20} />
          </button>
          <button 
            onClick={handleStartCall}
            className="hover:text-blue-600 transition-colors"
            title="Instant Video Call"
          >
            <Video size={20} />
          </button>
          <button className="hover:text-blue-600 transition-colors"><Info size={20} /></button>
        </div>
      </header>

      <ScheduleCallModal 
        isOpen={showScheduleModal} 
        onClose={() => setShowScheduleModal(false)} 
        receiverId={receiverId}
        receiverName={receiver?.name}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f8fafc]">
        <div className="flex flex-col items-center py-8 text-center">
           <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-3">
             {receiver?.profilePic ? (
                <img src={receiver.profilePic} className="w-20 h-20 rounded-full object-cover" alt="" />
              ) : (
                <div className="text-3xl font-bold text-blue-600">{receiver?.name?.charAt(0)}</div>
              )}
           </div>
           <h4 className="font-bold text-gray-900 text-lg">{receiver?.name}</h4>
           <p className="text-sm text-gray-500 max-w-xs">This is the beginning of your direct message history with {receiver?.name}.</p>
        </div>

        {chatHistory.map((msg, index) => {
          const isMe = (msg.senderId || msg.sender?._id) === (user.id || user._id);
          return (
            <MessageBubble 
              key={index} 
              message={msg.text} 
              isMe={isMe} 
              timestamp={msg.createdAt}
              senderName={msg.sender?.name || user.name}
              senderPic={msg.sender?.profilePic || user.profilePic}
            />
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <ChatInput 
        value={message} 
        onChange={handleTyping} 
        onSend={handleSend} 
        placeholder={`Message @${receiver?.name || 'User'}`} 
      />
    </div>
  );

  return (
    <ChatLayout sidebar={<ConversationList user={user} />}>
      {chatContent}
    </ChatLayout>
  );
};

export default PrivateChat;
