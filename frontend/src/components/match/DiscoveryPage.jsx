import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Heart, X, Star } from "lucide-react";

const DiscoveryPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Store direction to tell the exit animation which way to fly
  const [exitDirection, setExitDirection] = useState(0);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/matches/discover", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfiles(res.data);
      } catch (err) {
        console.error("Error fetching profiles", err);
      }
    };
    fetchProfiles();
  }, []);

  const handleSwipe = async (direction) => {
    const swipedProfile = profiles[currentIndex];
    
    // Set exit animation coordinates: Right is positive X, Left is negative X
    setExitDirection(direction === "right" ? 500 : -500);

    if (direction === "right") {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          "http://localhost:5000/api/matches/like",
          { targetUserId: swipedProfile._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (res.data.isMatch) {
          alert(`It's a Match with ${swipedProfile.name}!`);
        }
      } catch (err) {
        console.error("Error liking user", err);
      }
    }

    // Move to next card after state updates
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 10);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 overflow-hidden p-4">
      <div className="relative w-full max-w-sm h-[550px]">
        <AnimatePresence>
          {profiles.length > 0 && currentIndex < profiles.length && (
            <motion.div
              key={profiles[currentIndex]._id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ 
                x: exitDirection, 
                opacity: 0,
                rotate: exitDirection > 0 ? 25 : -25 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.x > 100) handleSwipe("right");
                else if (info.offset.x < -100) handleSwipe("left");
              }}
              className="absolute inset-0 bg-white rounded-3xl shadow-2xl border border-gray-100 cursor-grab active:cursor-grabbing overflow-hidden flex flex-col"
            >
              {/* Profile Image Section */}
              <div className="relative h-3/4 w-full bg-indigo-100 flex items-center justify-center">
                {profiles[currentIndex].profilePic ? (
                  <img 
                    src={profiles[currentIndex].profilePic} 
                    alt={profiles[currentIndex].name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Star size={80} className="text-indigo-300" />
                )}
                {/* Visual feedback on drag */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity">
                   {/* You could add "LIKE" or "NOPE" overlays here based on drag distance */}
                </div>
              </div>

              {/* User Info Section */}
              <div className="p-6 bg-white flex-1">
                <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                  {profiles[currentIndex].name}
                </h2>
                <p className="text-gray-500 text-sm mb-3">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {profiles[currentIndex].interests?.length > 0 ? (
                    profiles[currentIndex].interests.map((interest, i) => (
                      <span 
                        key={i} 
                        className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs italic">No interests listed</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {currentIndex >= profiles.length && profiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center p-6 bg-white rounded-3xl border border-dashed border-gray-300 shadow-inner"
          >
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Star size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">All caught up!</h3>
            <p className="text-gray-500 mt-2">There are no new profiles in your area right now.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 text-indigo-600 font-semibold hover:underline"
            >
              Refresh Profiles
            </button>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      {currentIndex < profiles.length && (
        <div className="flex items-center gap-8 mt-10">
          <button 
            onClick={() => handleSwipe("left")}
            className="p-5 bg-white text-red-500 rounded-full shadow-xl hover:bg-red-50 hover:scale-110 transition-all active:scale-95 border border-gray-100"
            aria-label="Skip"
          >
            <X size={28} strokeWidth={3} />
          </button>
          
          <button 
            onClick={() => handleSwipe("right")}
            className="p-6 bg-white text-green-500 rounded-full shadow-xl hover:bg-green-50 hover:scale-110 transition-all active:scale-95 border border-gray-100"
            aria-label="Like"
          >
            <Heart size={32} fill="currentColor" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscoveryPage;