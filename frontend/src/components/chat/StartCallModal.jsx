import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Video, Calendar, ArrowRight, User } from "lucide-react";
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Initiate Connection</h3>
                <p className="text-gray-400 text-sm font-medium">Select a match to start a video session</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                
                {/* Left: User Selection */}
                <div className="flex-1 p-8 border-r border-gray-100 flex flex-col overflow-hidden">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Search matches..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Loading Matches...</p>
                            </div>
                        ) : filteredMatches.length > 0 ? (
                            filteredMatches.map(match => (
                                <button
                                    key={match._id}
                                    onClick={() => setSelectedUser(match)}
                                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${selectedUser?._id === match._id ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "hover:bg-gray-50 text-gray-700"}`}
                                >
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                                        {match.profilePic ? (
                                            <img src={match.profilePic} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold uppercase">
                                                {match.name?.charAt(0) || "U"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-black leading-none">{match.name || "Anonymous"}</p>
                                            {match.status && (
                                                <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                                                    match.status === "matched" ? "bg-green-100 text-green-600" : 
                                                    match.status === "they_liked" ? "bg-pink-100 text-pink-600" :
                                                    match.status === "connected" ? "bg-blue-100 text-blue-600" :
                                                    "bg-gray-100 text-gray-400"
                                                }`}>
                                                    {match.status.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${selectedUser?._id === match._id ? "text-blue-100" : "text-gray-400"}`}>
                                            {match.status === "matched" || match.status === "connected" ? "Ready to Connect" : "Pending Match"}
                                        </p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="py-20 text-center px-6">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User size={32} className="text-gray-300" />
                                </div>
                                <p className="text-gray-900 font-black mb-1">No Matches Available</p>
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest leading-relaxed">
                                    Connections only appear here after you've both liked each other in Discovery or joined a group.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Call Config */}
                <div className="w-full md:w-[280px] bg-gray-50/50 p-8 flex flex-col">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Call Settings</h4>
                    
                    <div className="space-y-4 mb-10">
                        <button 
                            onClick={() => setCallType("instant")}
                            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${callType === "instant" ? "bg-white border-blue-600 shadow-sm" : "bg-transparent border-transparent opacity-60 hover:opacity-100"}`}
                        >
                            <div className={`p-2 rounded-lg ${callType === "instant" ? "bg-blue-50 text-blue-600" : "bg-gray-200 text-gray-500"}`}>
                                <Video size={18} />
                            </div>
                            <span className="font-bold text-sm">Instant Call</span>
                        </button>

                        <button 
                            onClick={() => setCallType("scheduled")}
                            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${callType === "scheduled" ? "bg-white border-blue-600 shadow-sm" : "bg-transparent border-transparent opacity-60 hover:opacity-100"}`}
                        >
                            <div className={`p-2 rounded-lg ${callType === "scheduled" ? "bg-blue-50 text-blue-600" : "bg-gray-200 text-gray-500"}`}>
                                <Calendar size={18} />
                            </div>
                            <span className="font-bold text-sm">Schedule Session</span>
                        </button>
                    </div>

                    {callType === "scheduled" && (
                        <div className="space-y-3 mb-8">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date & Time</label>
                            <input 
                                type="datetime-local" 
                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm text-gray-700"
                                value={scheduledFor}
                                onChange={(e) => setScheduledFor(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                            />
                        </div>
                    )}

                    <div className="mt-auto">
                        <button
                            disabled={!selectedUser || submitting}
                            onClick={handleStartCall}
                            className="w-full bg-gray-900 hover:bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-900/10 transition-all flex items-center justify-center gap-2 group disabled:bg-gray-200 disabled:shadow-none"
                        >
                            {submitting ? "Initiating..." : (
                                <>
                                    {callType === "instant" ? "Launch Call" : "Book Session"}
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
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
