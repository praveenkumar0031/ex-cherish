import React, { useState, useEffect } from "react";
import axios from "axios";
import PrivateChat from "../chat/PrivateChat"; // The component we created in Step 1
import { useNavigate } from "react-router-dom";
const DiscoveryPage = () => {
  const [matches, setMatches] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Track who we are chatting with
const navigate = useNavigate();
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/matches/discover", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setMatches(res.data);
      } catch (err) {
        console.error("Error fetching matches", err);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="discovery-container p-6">
      <h1 className="text-2xl font-bold mb-6">People who match your interests</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div key={match._id} className="border p-4 rounded-lg shadow hover:shadow-xl transition">
            <img 
              src={match.profilePic || "/default-avatar.png"} 
              alt={match.name} 
              className="w-full h-48 object-cover rounded-md"
            />
            <div className="mt-4 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg">{match.name}</h2>
                <p className="text-gray-600 text-sm">{match.interests.join(", ")}</p>
              </div>
              {/* MESSAGE BUTTON */}
              <button 
                onClick={() => setSelectedUser(match)}
                className="bg-primary text-white p-2 rounded-full hover:bg-opacity-80"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CHAT OVERLAY / MODAL */}
      {selectedUser && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="relative">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ✕
            </button>
            <PrivateChat 
              receiverId={selectedUser._id} 
              receiverName={selectedUser.name} 
            />
          </div>
        </div>
      )}
      <button 
    onClick={() => navigate(`/private-chat/${match._id}`)}
    className="bg-primary text-white p-2 rounded-full hover:bg-opacity-80"
  >
    {/* SVG Icon */}
  </button>
    </div>
  );
};

export default DiscoveryPage;