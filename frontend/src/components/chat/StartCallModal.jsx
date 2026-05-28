import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Video, Calendar, ArrowRight, User, ShieldCheck, Sparkles, Activity, Clock } from "lucide-react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

const StartCallModal = ({ isOpen, onClose }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [callType, setCallType] = useState("instant"); // instant or scheduled
  const [scheduledFor, setScheduledFor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchMatches();
    }
  }, [isOpen]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      const [res, statsRes] = await Promise.all([
        API.get("matches/my-matches"),
        API.get("matches/debug-stats").catch(() => ({ data: {} }))
      ]);

      setMatches(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("API Error fetching matches:", err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = async () => {
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      if (callType === "instant") {
          const res = await API.post("calls/create", { receiverId: selectedUser._id });
          const callData = res.data;
          
          if (callData && callData.roomId) {
              navigate(`/call/${callData.roomId}?initiator=true&receiverId=${selectedUser._id}`);
              onClose();
          } else {
              throw new Error("Failed to generate room ID");
          }
      } else {
          if (!scheduledFor) {
              alert("Please select a date and time");
              return;
          }
          const res = await API.post("calls/schedule", { 
              receiverId: selectedUser._id, 
              scheduledFor 
          });
          
          alert("Call scheduled successfully!");
          onClose();
      }
    } catch (err) {
      console.error("Failed to initiate call:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to start call";
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMatches = matches.filter(m => {
    if (!m || (!m.name && !m._id)) return false;
    const nameStr = m.name || "Anonymous";
    return nameStr.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-4xl bg-white rounded-[4rem] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row max-h-[85vh] border border-slate-100"
          >
            {/* Left: Partner Selection */}
            <div className="flex-1 p-10 flex flex-col overflow-hidden border-r border-slate-50 bg-white">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl font-[900] text-slate-900 tracking-tight">Initiate Uplink</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Select Destination Node</p>
                    </div>
                    <button onClick={onClose} className="md:hidden p-3 hover:bg-slate-50 rounded-2xl transition-all">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="relative mb-8 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder="Search authenticated nodes..."
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-3">
                    {loading ? (
                        <div className="py-24 text-center">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                            <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]">Scanning Grid...</p>
                        </div>
                    ) : filteredMatches.length > 0 ? (
                        filteredMatches.map(match => (
                            <button
                                key={match._id}
                                onClick={() => setSelectedUser(match)}
                                className={`w-full p-6 rounded-[2rem] flex items-center gap-6 transition-all duration-500 relative border ${
                                    selectedUser?._id === match._id 
                                    ? "bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/20 translate-x-2" 
                                    : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 hover:translate-x-1"
                                }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className={`w-16 h-16 rounded-3xl overflow-hidden border-2 transition-all duration-500 ${selectedUser?._id === match._id ? "border-white/20 scale-105" : "border-slate-100 shadow-md group-hover:scale-105"}`}>
                                        {match.profilePic ? (
                                            <img src={match.profilePic} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${selectedUser?._id === match._id ? "bg-white/10 text-white" : "bg-blue-50 text-blue-600"} font-[900] text-2xl`}>
                                                {match.name?.charAt(0) || "U"}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-4 rounded-full transition-colors ${selectedUser?._id === match._id ? "bg-green-400 border-slate-900" : "bg-green-500 border-white"}`}></div>
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className={`font-[900] text-lg truncate tracking-tight transition-colors ${selectedUser?._id === match._id ? "text-white" : "text-slate-900"}`}>{match.name || "Anonymous"}</p>
                                        <ShieldCheck size={14} className={selectedUser?._id === match._id ? "text-blue-400" : "text-blue-500"} />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                                            selectedUser?._id === match._id ? "bg-white/10 text-blue-300" : "bg-slate-100 text-slate-400"
                                        }`}>
                                            {match.status?.replace('_', ' ') || "Available"}
                                        </span>
                                        <span className={`text-[10px] font-bold ${selectedUser?._id === match._id ? "text-white/40" : "text-slate-300"}`}>Ready for sync</span>
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="py-24 text-center px-10 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-white rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <User size={32} className="text-slate-200" />
                            </div>
                            <p className="text-slate-900 font-[900] mb-2">No Verified Nodes</p>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest leading-relaxed">Expand your Discovery radius or finalize mutual likes to populate this list.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Protocol Config */}
            <div className="w-full md:w-[360px] bg-slate-50/80 p-10 flex flex-col border-l border-slate-50 relative">
                <button onClick={onClose} className="hidden md:block absolute top-6 right-6 p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                    <X size={20} className="text-slate-400" strokeWidth={3} />
                </button>

                <div className="mb-10 pt-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Uplink Parameters</h4>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={() => setCallType("instant")}
                            className={`w-full p-6 rounded-[2rem] border-4 flex items-center gap-5 transition-all duration-500 ${callType === "instant" ? "bg-white border-blue-600 shadow-2xl shadow-blue-900/5" : "bg-transparent border-transparent opacity-60 hover:opacity-100"}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${callType === "instant" ? "bg-blue-600 text-white shadow-xl shadow-blue-200" : "bg-slate-200 text-slate-500"}`}>
                                <Video size={22} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <span className={`block font-[900] text-sm ${callType === "instant" ? "text-slate-900" : "text-slate-500"}`}>Instant Link</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Real-time sync</span>
                            </div>
                        </button>

                        <button 
                            onClick={() => setCallType("scheduled")}
                            className={`w-full p-6 rounded-[2rem] border-4 flex items-center gap-5 transition-all duration-500 ${callType === "scheduled" ? "bg-white border-blue-600 shadow-2xl shadow-blue-900/5" : "bg-transparent border-transparent opacity-60 hover:opacity-100"}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${callType === "scheduled" ? "bg-blue-600 text-white shadow-xl shadow-blue-200" : "bg-slate-200 text-slate-500"}`}>
                                <Calendar size={22} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <span className={`block font-[900] text-sm ${callType === "scheduled" ? "text-slate-900" : "text-slate-500"}`}>Queue Session</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Future allocation</span>
                            </div>
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {callType === "scheduled" ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            key="scheduled-input"
                            className="space-y-4 mb-8"
                        >
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Time-Space Coordinate</label>
                            <div className="relative">
                                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                                <input 
                                    type="datetime-local" 
                                    className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.8rem] focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-sm text-slate-700 shadow-inner transition-all"
                                    value={scheduledFor}
                                    onChange={(e) => setScheduledFor(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            key="instant-status"
                            className="mb-8 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-center gap-4 shadow-inner"
                        >
                            <Activity className="text-blue-600 animate-pulse" size={24} />
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Ready for Launch</p>
                                <p className="text-[11px] font-medium text-blue-800 leading-tight">Peer signal established.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-auto pt-8">
                    <button
                        disabled={!selectedUser || submitting}
                        onClick={handleStartCall}
                        className="w-full bg-slate-900 hover:bg-blue-600 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-4 group disabled:bg-slate-200 disabled:shadow-none active:scale-[0.98]"
                    >
                        {submitting ? (
                            <>
                                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Negotiating...</span>
                            </>
                        ) : (
                            <>
                                {callType === "instant" ? "Initialize Uplink" : "Queue Session"}
                                <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-2 transition-transform duration-500" />
                            </>
                        )}
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <ShieldCheck size={14} className="text-slate-300" />
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">End-to-End Encrypted Tunnel</span>
                    </div>
                </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StartCallModal;
