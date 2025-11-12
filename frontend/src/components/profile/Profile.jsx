import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, Calendar, Phone, Star, Coins } from "lucide-react";

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    axios
      .get(`http://localhost:5000/api/profile/${user._id}`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error(err));
  }, [user]);

  if (!profile) return <div className="text-center mt-20">Loading...</div>;

  const filledFields = ["dob", "mobile", "interestedAreas", "profileImage"].filter(
    (f) => profile[f] && (Array.isArray(profile[f]) ? profile[f].length > 0 : true)
  ).length;

  const completion = Math.round((filledFields / 4) * 100);

  // ✅ Ensure credit is numeric before using .toFixed()
  const creditValue = Number(profile.credit) || 0;

  return (
    <div className="flex flex-col items-center py-10 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-2xl">
        <div className="flex flex-col items-center mb-6">
          {/* ✅ Profile Image */}
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
            {profile.profileImage ? (
              <img
                src={`http://localhost:5000/${profile.profileImage}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="bg-blue-100 w-full h-full flex items-center justify-center">
                <User className="text-blue-600" size={48} />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-3">
            {profile.name}
          </h2>
          <p className="text-gray-500">{profile.email}</p>
        </div>

        {/* ✅ Profile Completion */}
        <div className="mb-8">
          <h3 className="text-gray-700 font-medium mb-2">
            Profile Completion: {completion}%
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                completion === 100 ? "bg-green-600" : "bg-blue-500"
              }`}
              style={{ width: `${completion}%` }}
            ></div>
          </div>
        </div>

        {/* ✅ Credit Score Section */}
        <div className="flex items-center gap-3 mb-6">
          <Coins className="text-orange-500" size={20} />
          <span className="text-gray-800 font-semibold">
            Credit Score:{" "}
            <span className="text-blue-600">{creditValue.toFixed(2)}</span>
          </span>
        </div>

        {/* ✅ Profile Details */}
        <div className="space-y-4 text-gray-700">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-500" size={20} />
            <span>
              <strong>Date of Birth:</strong>{" "}
              {profile.dob ? profile.dob : "Not added"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-green-500" size={20} />
            <span>
              <strong>Mobile:</strong>{" "}
              {profile.mobile ? profile.mobile : "Not added"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Star className="text-yellow-500" size={20} />
            <strong>Interested Areas:</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.interestedAreas?.length > 0 ? (
              profile.interestedAreas.map((area, i) => (
                <span
                  key={i}
                  className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm"
                >
                  {area}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No interests added yet.</p>
            )}
          </div>
        </div>

        {/* ✅ Edit Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => (window.location.href = "/edit-profile")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
