import React, { useEffect, useState } from "react";
import {
  User,
  Calendar,
  Phone,
  Coins,
  Edit3,
  ShieldCheck,
  Mail,
  MapPin,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

const Profile = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!user?.id && !user?._id) {
          setLoading(false);
          setError("User not found");
          return;
        }

        setLoading(true);

        const userId = user.id || user._id;

        // FIXED API URL
        const res = await API.get(`/profile/${userId}`);

        const data = res?.data || {};

        // Safe interestedAreas handling
        if (typeof data.interestedAreas === "string") {
          try {
            data.interestedAreas = JSON.parse(data.interestedAreas);
          } catch {
            data.interestedAreas = [];
          }
        }

        if (!Array.isArray(data.interestedAreas)) {
          data.interestedAreas = [];
        }

        setProfile(data);
        setError("");
      } catch (err) {
        console.error("Profile fetch error:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

        <p className="text-gray-500 font-medium">
          Loading your profile...
        </p>
      </div>
    );
  }

  // Error State
  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-red-100">
          <AlertCircle size={40} />
        </div>

        <h3 className="text-2xl font-black text-gray-800">
          Oops!
        </h3>

        <p className="text-gray-500 mt-2 mb-8 max-w-xs">
          {error || "Something went wrong while fetching your data."}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const filledFields = [
    "dob",
    "mobile",
    "interestedAreas",
    "profilePic",
  ].filter((field) => {
    const value = profile[field];

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return Boolean(value);
  }).length;

  const completion = Math.round((filledFields / 4) * 100);

  const creditValue = Number(profile?.credit || 0);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fafbff] py-12 px-6 relative overflow-hidden">

      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-br from-blue-600 to-indigo-700 -z-10" />

      <div className="absolute top-[250px] left-0 w-full h-[100px] bg-[#fafbff] rounded-t-[3rem] -z-10" />

      <div className="max-w-4xl mx-auto">

        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-80 bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 p-8 flex flex-col items-center"
          >

            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">

                {profile?.profilePic ? (
                  <img
                    src={profile.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-blue-50 w-full h-full flex items-center justify-center">
                    <User className="text-blue-600" size={56} />
                  </div>
                )}

              </div>

              <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-8 h-8 rounded-full" />
            </div>

            <h2 className="text-2xl font-black text-gray-900 text-center">
              {profile?.name || "User"}
            </h2>

            <p className="text-gray-400 font-medium text-sm mb-6 flex items-center gap-1">
              <ShieldCheck size={14} className="text-blue-500" />
              Verified Member
            </p>

            <div className="w-full space-y-4">

              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
                    <Coins size={20} />
                  </div>

                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Credits
                  </span>

                </div>

                <span className="text-xl font-black text-gray-900">
                  {creditValue.toFixed(0)}
                </span>

              </div>

              <button
                onClick={() => navigate("/edit-profile")}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-gray-900/10"
              >
                <Edit3 size={18} />
                Edit Profile
              </button>

            </div>

          </motion.div>

          {/* Main Content */}
          <div className="flex-1 space-y-8 w-full">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 shadow-sm"
            >

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                <div className="space-y-4">

                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail size={18} className="text-blue-600" />

                    <span className="font-medium">
                      {profile?.email || "No email"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone size={18} className="text-green-600" />

                    <span className="font-medium">
                      {profile?.mobile || "Add mobile number"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin size={18} className="text-red-500" />

                    <span className="font-medium">
                      Global Network
                    </span>
                  </div>

                </div>

                <div className="text-right">

                  <div className="inline-flex flex-col items-end">

                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
                      Completion
                    </span>

                    <div className="flex items-center gap-3">

                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${completion}%` }}
                        />

                      </div>

                      <span className="text-lg font-black text-gray-900">
                        {completion}%
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </motion.div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;