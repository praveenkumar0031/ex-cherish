import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { 
  Users, 
  User, 
  Heart, 
  X, 
  Sparkles, 
  MessageCircle, 
  MapPin, 
  Zap, 
  Info, 
  ShieldCheck, 
  Ghost 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DiscoveryPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState(0);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const res = await API.get("matches/discover");
        setProfiles(res.data || []);
      } catch (err) {
        console.error("Error fetching profiles", err);
        setProfiles([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleSwipe = async (direction) => {
    if (currentIndex >= profiles.length) return;
    
    const swipedProfile = profiles[currentIndex];
    setExitDirection(direction === "right" ? 1000 : -1000);

    if (direction === "right") {
      try {
        const res = await API.post("matches/like", { 
          userId: swipedProfile.user?._id || swipedProfile.user 
        });
        
        if (res.data.status === "matched") {
          setMatchData({
            profile: swipedProfile,
            room: res.data.room
          });
        }
      } catch (err) {
        console.error("Error liking user", err);
      }
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setExitDirection(0);
    }, 300);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] gap-6 bg-slate-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Scanning Proximity Nodes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Immersive Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-100/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-100/40 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '30px 30px' }} />
      </div>

      <header className="absolute top-10 left-0 w-full px-10 flex justify-between items-center z-20 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-md border border-white/50 px-5 py-2 rounded-2xl shadow-xl shadow-blue-900/5 flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Global Discovery Live</span>
          </div>
          <div className="bg-slate-900/10 backdrop-blur-md border border-white/20 px-5 py-2 rounded-2xl flex items-center gap-3">
              <Users size={14} className="text-slate-600" />
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{profiles.length - currentIndex} Nodes Remaining</span>
          </div>
      </header>

      <div className="relative w-full max-w-[420px] h-[640px] z-10 perspective-1000">
        <AnimatePresence mode="popLayout">
          {profiles.length > 0 && currentIndex < profiles.length ? (
            <motion.div
              key={profiles[currentIndex]._id}
              initial={{ scale: 0.9, opacity: 0, y: 20, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ 
                x: exitDirection, 
                opacity: 0,
                rotate: exitDirection > 0 ? 45 : -45,
                transition: { duration: 0.5, ease: "anticipate" }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.x > 120) handleSwipe("right");
                else if (info.offset.x < -120) handleSwipe("left");
              }}
              className="absolute inset-0 bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 cursor-grab active:cursor-grabbing overflow-hidden flex flex-col group touch-none"
            >
              {/* Profile Image Section */}
              <div className="relative h-[75%] w-full overflow-hidden bg-slate-100">
                {profiles[currentIndex].user?.profilePic ? (
                  <img 
                    src={profiles[currentIndex].user.profilePic} 
                    alt={profiles[currentIndex].user.name} 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-4">
                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-slate-900/5">
                        <User size={48} className="text-slate-300" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image Unavailable</span>
                  </div>
                )}
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                <div className="absolute top-6 right-6">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl text-white">
                        <Info size={18} />
                    </div>
                </div>

                {/* Status Badges */}
                <div className="absolute top-6 left-8 flex gap-2">
                    <div className="bg-green-500/20 backdrop-blur-xl border border-green-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Online</span>
                    </div>
                </div>
                
                {/* Text on Image */}
                <div className="absolute bottom-10 left-10 right-10 text-white">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-4xl font-[900] tracking-tight">{profiles[currentIndex].user?.name?.split(' ')[0]}</h2>
                                <div className="bg-blue-600 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-600/40">
                                    <ShieldCheck size={12} strokeWidth={3} />
                                    <span className="text-[9px] font-black uppercase tracking-tighter">Verified</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="flex items-center gap-2 text-white/80 text-[11px] font-black uppercase tracking-widest">
                                    <Zap size={14} className="text-yellow-400 fill-yellow-400" /> 
                                    {profiles[currentIndex].matchScore ? `${profiles[currentIndex].matchScore * 10}% Compatibility` : "Optimize sync"}
                                </p>
                                <p className="flex items-center gap-2 text-white/60 text-[11px] font-black uppercase tracking-widest">
                                    <MapPin size={14} className="text-blue-400" /> Nearby
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              {/* User Info Section */}
              <div className="p-8 flex-1 flex flex-col justify-between bg-white relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
                
                {/* Bio Snippet */}
                <div className="mb-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Protocol Bio</p>
                  <p className="text-slate-600 text-[11px] font-medium leading-relaxed line-clamp-2 italic">
                    {profiles[currentIndex].bio || "No professional biography established for this node."}
                  </p>
                </div>

                {/* Knowledge Cluster */}
                <div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3">Knowledge Cluster</p>
                  <div className="flex flex-wrap gap-2">
                  {profiles[currentIndex].interestedAreas?.length > 0 ? (
                      profiles[currentIndex].interestedAreas.slice(0, 3).map((interest, i) => (
                      <span 
                          key={`int-${i}`} 
                          className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-bold border border-slate-100/60 transition-all hover:bg-blue-600 hover:text-white"
                      >
                          {interest}
                      </span>
                      ))
                  ) : (
                      <span className="text-slate-400 text-[10px] italic font-medium">No domains identified.</span>
                  )}
                  </div>
                </div>

                {/* Categories/Tags */}
                <div className="mt-4 flex items-center gap-3">
                   {profiles[currentIndex].categories?.slice(0, 2).map((cat, i) => (
                       <span key={`cat-${i}`} className="text-[9px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg uppercase tracking-wider border border-green-100">
                           {cat}
                       </span>
                   ))}
                   {profiles[currentIndex].tags?.slice(0, 2).map((tag, i) => (
                       <span key={`tag-${i}`} className="text-[9px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-wider border border-blue-50">
                           #{tag}
                       </span>
                   ))}
                </div>
              </div>
            </motion.div>
          ) : !loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center p-12 bg-white rounded-[4rem] shadow-2xl border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '20px 20px' }} />
              
              <div className="relative mb-10">
                  <div className="w-28 h-28 bg-blue-50 text-blue-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner border border-blue-100/50">
                    <Ghost size={56} strokeWidth={1.5} />
                  </div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="absolute -inset-4 border-2 border-dashed border-blue-200/50 rounded-full" 
                  />
              </div>
              
              <h3 className="text-3xl font-[900] text-slate-900 tracking-tight mb-4">Node Exhaustion</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-12">You've reached the edge of your current proximity network. Recalibrate your interests to expand your reach.</p>
              
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[2rem] shadow-2xl shadow-slate-900/10 hover:bg-blue-600 transition-all active:scale-95"
              >
                Refresh Network Grid
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      {currentIndex < profiles.length && (
        <div className="flex items-center gap-10 mt-16 z-20">
          <button 
            onClick={() => handleSwipe("left")}
            className="w-20 h-20 bg-white text-slate-400 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:text-red-500 hover:border-red-100 transition-all active:scale-90 border border-slate-100 flex items-center justify-center group"
          >
            <X size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
          
          <button 
            onClick={() => handleSwipe("right")}
            className="w-24 h-24 bg-blue-600 text-white rounded-full shadow-[0_25px_60px_-10px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:scale-110 transition-all active:scale-90 flex items-center justify-center relative group"
          >
            <Heart size={38} fill="currentColor" strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            <div className="absolute -inset-4 rounded-full border border-blue-400/20 animate-ping pointer-events-none" />
          </button>
        </div>
      )}

      {/* Match Popup */}
      <AnimatePresence>
        {matchData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center text-white max-w-sm"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-6 inline-block"
              >
                  <Sparkles size={64} className="text-yellow-400 mx-auto" />
              </motion.div>
              
              <h2 className="text-5xl font-[900] italic mb-4 tracking-tighter uppercase leading-none">Mutual Node Lock!</h2>
              <p className="text-blue-200/80 font-bold uppercase tracking-widest text-[10px] mb-12 italic">Handshake successful with {matchData?.profile?.user?.name}</p>
              
              <div className="flex justify-center items-center gap-6 mb-16 relative">
                 <div className="w-28 h-28 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden -rotate-12 ring-8 ring-white/10 relative z-10">
                    <img src={matchData?.profile?.user?.profilePic} className="w-full h-full object-cover" alt="" />
                 </div>
                 
                 <div className="absolute inset-0 flex items-center justify-center z-20">
                     <div className="bg-red-500 p-4 rounded-full shadow-2xl animate-pulse">
                        <Heart className="text-white fill-white" size={32} />
                     </div>
                 </div>

                 <div className="w-28 h-28 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden rotate-12 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-[900] text-3xl ring-8 ring-white/10 relative z-10 uppercase">
                    YOU
                 </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => navigate(`/private-chat/${matchData?.profile?.user?._id || matchData?.profile?.user}`)}
                  className="w-full py-5 bg-white text-slate-900 font-black rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl hover:bg-blue-50 transition-all uppercase tracking-widest text-[11px]"
                >
                  <MessageCircle size={20} strokeWidth={3} /> Initiate Uplink
                </button>
                <button 
                  onClick={() => setMatchData(null)}
                  className="w-full py-5 bg-white/5 border border-white/20 text-white/60 font-black rounded-[2rem] hover:bg-white/10 transition-all uppercase tracking-widest text-[10px]"
                >
                  Scan Next Node
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscoveryPage;
