import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DiscoveryPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [viewMode, setViewMode] = useState('suggested'); // 'suggested' or 'all'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchProfiles = async (mode) => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token"); // Get token from storage

    const endpoint = mode === 'suggested' ? '/api/matches/discover' : '/api/profiles/all';
    
    const res = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}` // Send the token here
      }
    });
    
    setProfiles(res.data);
  } catch (err) {
    console.error("Error fetching profiles", err);
    if (err.response?.status === 401) {
       // Optional: Redirect to login if token is expired/missing
       console.log("Session expired. Please login again.");
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProfiles(viewMode);
  }, [viewMode]);

  const handleLike = async (userId) => {
  try {
    const token = localStorage.getItem("token"); // 1. Get the token

    const res = await axios.post(
      `/api/matches/like/${userId}`, 
      {}, // 2. Empty body (since userId is in the URL)
      {
        headers: {
          Authorization: `Bearer ${token}` // 3. Pass the header
        }
      }
    );

    if (res.data.status === "matched") {
      alert("It's a Match! You can now chat.");
      navigate(`/chat/${res.data.room._id}`); // Redirect to the new room
    } else {
      alert("Interest sent!");
    }
  } catch (err) {
    console.error("Like Error:", err.response);
    if (err.response?.status === 401) {
      alert("Your session has expired. Please log in again.");
    } else {
      alert("Error sending like");
    }
  }
};

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-extrabold text-gray-800">
          {viewMode === 'suggested' ? "Suggested for You" : "All Community Profiles"}
        </h2>

        {/* Toggle Switch */}
        <div className="flex bg-white p-1 rounded-lg shadow-inner border border-gray-200">
          <button 
            onClick={() => setViewMode('suggested')}
            className={`px-4 py-2 rounded-md transition ${viewMode === 'suggested' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'}`}
          >
            Matches
          </button>
          <button 
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-md transition ${viewMode === 'all' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'}`}
          >
            All Members
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Loading profiles...</div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow">
          No profiles found. Try updating your interests!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {profiles.map((profile) => (
            <div key={profile.userId || profile._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 group">
              <div className="relative">
                <img 
                  src={profile.profilePic || 'https://via.placeholder.com/150'} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={profile.name}
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-blue-700 shadow-sm">
                  {profile.credit || 0} Credits
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800">{profile.name}</h3>
                <p className="text-sm text-gray-500 mb-4 truncate">{profile.email}</p>
                
                <div className="flex flex-wrap gap-2 h-16 overflow-y-auto mb-4 scrollbar-hide">
                  {profile.interestedAreas?.map(area => (
                    <span key={area} className="px-3 py-1 bg-gray-100 text-gray-700 text-[10px] uppercase tracking-wider font-bold rounded-md">
                      {area}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => handleLike(profile.userId || profile.user?._id)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscoveryPage;