import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import { Hash, MessageCircle, Search, Plus, Sparkles, Activity, ShieldCheck, Users } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";
import { motion, AnimatePresence } from "framer-motion";

const ConversationList = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { roomId, receiverId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await API.get("chat/my-chats");
        setConversations(res.data || []);
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const handleGroupCreated = (newGroup) => {
    setConversations([newGroup, ...conversations]);
    navigate(`/interest-chat/${newGroup._id}`);
  };

  const filteredConversations = conversations.filter(conv => 
    (conv.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    conv.members.some(m => (m.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      
      {/* Header */}
      <div className="p-8 border-b border-slate-50 space-y-8 bg-slate-50/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-[900] text-slate-900 tracking-tight">Messages</h2>
            <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway Active</span>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-12 h-12 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center active:scale-90 group"
            title="Deploy New Cluster"
          >
            <Plus size={24} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search local nodes..." 
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none shadow-sm placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <CreateGroupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={handleGroupCreated}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2">
        <div className="px-4 py-4 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Active Streams</span>
            {loading && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
        </div>
        
        <AnimatePresence mode="popLayout">
            {filteredConversations.map((conv, index) => {
            const isGroup = conv.isGroup;
            const isActive = roomId === conv._id || (conv.members.length === 2 && conv.members.some(m => m._id === receiverId));
            
            // For private chats, find the OTHER member
            const otherMember = !isGroup ? conv.members.find(m => m._id !== (user.id || user._id)) : null;

            return (
                <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                key={conv._id}
                onClick={() => {
                    if (isGroup) {
                    navigate(`/interest-chat/${conv._id}`);
                    } else {
                    navigate(`/private-chat/${otherMember?._id}`);
                    }
                }}
                className={`group flex items-center gap-4 p-4 rounded-[2rem] cursor-pointer transition-all duration-300 relative border ${
                    isActive 
                    ? "bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/20 z-10" 
                    : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100"
                }`}
                >
                <div className="relative flex-shrink-0">
                    {isGroup ? (
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner ${isActive ? "bg-white/10" : "bg-slate-50 text-slate-400 group-hover:text-blue-600"}`}>
                        <Hash size={24} strokeWidth={isActive ? 3 : 2} />
                    </div>
                    ) : (
                    <>
                        <div className={`w-14 h-14 rounded-[1.5rem] overflow-hidden border-2 transition-all duration-300 shadow-sm ${isActive ? "border-white/20" : "border-slate-100 group-hover:scale-105"}`}>
                            {otherMember?.profilePic ? (
                                <img src={otherMember.profilePic} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center ${isActive ? "bg-white/10 text-white" : "bg-blue-50 text-blue-600"} font-black text-xl`}>
                                    {otherMember?.name?.charAt(0) || "U"}
                                </div>
                            )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-4 rounded-full transition-colors ${isActive ? "bg-green-400 border-slate-900" : "bg-green-500 border-white"}`}></div>
                    </>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <p className={`text-[15px] font-[900] truncate tracking-tight transition-colors ${isActive ? "text-white" : "text-slate-900 group-hover:text-blue-600"}`}>
                        {isGroup ? conv.name : (otherMember?.name || "System Node")}
                        </p>
                        {isActive && (
                            <Activity size={12} className="text-blue-400" />
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isGroup ? (
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${isActive ? "bg-white/10 text-blue-200" : "bg-slate-100 text-slate-400"}`}>
                                <Users size={10} strokeWidth={3} /> {conv.members.length} Nodes
                            </div>
                        ) : (
                            <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isActive ? "text-blue-300/60" : "text-slate-400"}`}>
                                <ShieldCheck size={10} strokeWidth={3} /> Secure Uplink
                            </div>
                        )}
                    </div>
                </div>
                
                {isActive && (
                    <motion.div 
                        layoutId="active-pill"
                        className="absolute right-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" 
                    />
                )}
                </motion.div>
            );
            })}
        </AnimatePresence>

        {!loading && filteredConversations.length === 0 && (
          <div className="text-center py-20 px-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-6 border border-slate-100">
                <MessageCircle className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-400 font-bold text-sm leading-relaxed">No active communication streams identified in this sector.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-8 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:text-blue-700 transition-all border-b-2 border-blue-50 pb-1">Initialize First Node</button>
          </div>
        )}
      </div>
      
      {/* Absolute Bottom Badge */}
      <div className="p-6 bg-slate-50/50 backdrop-blur-sm border-t border-slate-100 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Excherish Protocol v1.0.4</p>
      </div>
    </div>
  );
};

export default ConversationList;
