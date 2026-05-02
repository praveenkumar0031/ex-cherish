import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Heart, X, Star, Info } from "lucide-react";

const DiscoveryPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const handleSwipe = (direction) => {
    const swipedProfile = profiles[currentIndex];
    console.log(`Swiped ${direction} on ${swipedProfile.name}`);

    if (direction === "right") {
      // Trigger match logic here
      const token = localStorage.getItem("token");
      axios.post("http://localhost:5000/api/matches/like", 
        { targetUserId: swipedProfile._id },
        { headers: { Authorization: `Bearer ${token}` }}
      );
    }

    // Move to next card
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 overflow-hidden">
      <div className="relative w-full max-w-sm h-[500px]">
        <AnimatePresence>
          {profiles.slice(currentIndex, currentIndex + 1).map((profile) => (
            <motion.div
              key={profile._id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ 
                x: direction === "right" ? 500 : -500, 
                opacity: 0,
                rotate: direction === "right" ? 20 : -20 
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.x > 100) handleSwipe("right");
                else if (info.offset.x < -100) handleSwipe("left");
              }}
              className="absolute inset-0 bg-white rounded-3xl shadow-2xl border border-gray-100 cursor-grab active:cursor-grabbing overflow-hidden"
            >
              {/* Profile Image/Placeholder */}
              <div className="h-2/3 bg-indigo-100 flex items-center justify-center">
                {profile.profilePic ? (
                  <img src={profile.profilePic} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <Star size={80} className="text-indigo-300" />
                )}
              </div>

              {/* User Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.interests?.map((interest, i) => (
                    <span 
                      key={i} 
                      className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {currentIndex >= profiles.length && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="bg-white p-8 rounded-full shadow-inner mb-4">
              <Star size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">No more profiles!</h3>
            <p className="text-gray-500">Check back later for more matches.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {currentIndex < profiles.length && (
        <div className="flex gap-6 mt-8">
          <button 
            onClick={() => handleSwipe("left")}
            className="p-4 bg-white text-red-500 rounded-full shadow-lg hover:scale-110 transition active:bg-red-50"
          >
            <X size={32} />
          </button>
          <button 
            onClick={() => handleSwipe("right")}
            className="p-4 bg-white text-green-500 rounded-full shadow-lg hover:scale-110 transition active:bg-green-50"
          >
            <Heart size={32} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscoveryPage;