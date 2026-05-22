import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { Heart, X, Sparkles, MessageCircle, MapPin, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DiscoveryPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState(0);
  const [matchData, setMatchData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await API.get("matches/discover");
        setProfiles(res.data || []);
      } catch (err) {
        console.error("Error fetching profiles", err);
        setProfiles([]); // Fallback to empty array
      }
    };
    fetchProfiles();
  }, []);

  const handleSwipe = async (direction) => {
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
    }, 10);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fdfbff] flex flex-col items-center justify-center p-4 overflow-hidden">
      
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md h-[600px] z-10">
        <AnimatePresence mode="popLayout">
          {profiles.length > 0 && currentIndex < profiles.length && (
            <motion.div
              key={profiles[currentIndex]._id}
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ 
                x: exitDirection, 
                opacity: 0,
                rotate: exitDirection > 0 ? 30 : -30,
                transition: { duration: 0.4 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.x > 150) handleSwipe("right");
                else if (info.offset.x < -150) handleSwipe("left");
              }}
              className="absolute inset-0 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100/50 cursor-grab active:cursor-grabbing overflow-hidden flex flex-col group"
            >
              {/* Profile Image Section */}
              <div className="relative h-[70%] w-full overflow-hidden">
                {profiles[currentIndex].user?.profilePic ? (
                  <img 
                    src={profiles[currentIndex].user.profilePic} 
                    alt={profiles[currentIndex].user.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                    <Sparkles size={80} className="text-blue-200" />
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Text on Image */}
                <div className="absolute bottom-6 left-8 right-6 text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-3xl font-black">{profiles[currentIndex].user?.name?.split(' ')[0]}</h2>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    <p className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
                        <Zap size={14} className="text-yellow-400 fill-yellow-400" /> 
                        {profiles[currentIndex].matchScore ? `${profiles[currentIndex].matchScore * 10}% Compatibility` : "Great Match"}
                    </p>
                </div>
              </div>

              {/* User Info Section */}
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Mutual Interests</p>
                    <div className="flex flex-wrap gap-2">
                    {profiles[currentIndex].interestedAreas?.length > 0 ? (
                        profiles[currentIndex].interestedAreas.map((interest, i) => (
                        <span 
                            key={i} 
                            className="bg-gray-50 text-gray-700 px-4 py-1.5 rounded-xl text-xs font-bold border border-gray-100 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                            {interest}
                        </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-xs italic">Exploring new interests</span>
                    )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400 text-xs mt-4">
                    <MapPin size={14} /> <span>Near your location</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {currentIndex >= profiles.length && profiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center p-10 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-dashed border-gray-200 shadow-inner"
          >
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-100">
              <Sparkles size={48} />
            </div>
            <h3 className="text-2xl font-black text-gray-800">Discover More?</h3>
            <p className="text-gray-500 mt-3 mb-8 leading-relaxed">You've seen all the amazing people nearby. Check back soon for fresh matches!</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              Refresh Deck
            </button>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      {currentIndex < profiles.length && (
        <div className="flex items-center gap-8 mt-12 z-20">
          <button 
            onClick={() => handleSwipe("left")}
            className="p-6 bg-white text-gray-400 rounded-full shadow-2xl hover:text-red-500 transition-all active:scale-90 border border-gray-50 group"
          >
            <X size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
          </button>
          
          <button 
            onClick={() => handleSwipe("right")}
            className="p-8 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-110 transition-all active:scale-90 relative"
          >
            <Heart size={36} fill="currentColor" />
            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20 pointer-events-none" />
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/90 backdrop-blur-lg p-6"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center text-white max-w-sm"
            >
              <h2 className="text-5xl font-black italic mb-2 tracking-tighter">IT'S A MATCH!</h2>
              <p className="text-blue-100 mb-10">You and {matchData.profile.user.name} liked each other.</p>
              
              <div className="flex justify-center items-center gap-4 mb-12">
                 <div className="w-24 h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden -rotate-12">
                    <img src={matchData.profile.user.profilePic} className="w-full h-full object-cover" alt="" />
                 </div>
                 <Heart className="text-red-500 fill-red-500 animate-pulse" size={40} />
                 <div className="w-24 h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden rotate-12 bg-white flex items-center justify-center text-blue-600 font-black text-2xl">
                    YOU
                 </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => navigate(`/private-chat/${matchData.profile.user._id}`)}
                  className="w-full py-4 bg-white text-blue-900 font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:bg-blue-50 transition-all"
                >
                  <MessageCircle size={20} /> SEND A MESSAGE
                </button>
                <button 
                  onClick={() => setMatchData(null)}
                  className="w-full py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
                >
                  KEEP SWIPING
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
