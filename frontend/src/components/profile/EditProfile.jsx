import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, X, Plus, Save, ArrowLeft, User, Phone, Calendar, Sparkles } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    dob: "",
    mobile: "",
    interestedAreas: [],
    profilePic: "",
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [newInterest, setNewInterest] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id && !user?._id) return;
      
      try {
        setFetching(true);
        const userId = user.id || user._id;
        const res = await API.get(`profile/${userId}`);
        let data = res.data;
        
        // Data sanitization
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
        setImagePreview(data.profilePic || null);
        setError(null);
      } catch (err) {
        console.error("EditProfile fetch error:", err);
        setError("Failed to load profile data.");
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const userId = user.id || user._id;

      const formDataToSend = new FormData();
      formDataToSend.append("name", profile.name);
      formDataToSend.append("email", profile.email);
      formDataToSend.append("dob", profile.dob);
      formDataToSend.append("mobile", profile.mobile);
      
      // Send array as JSON string for consistency or multi-part
      formDataToSend.append("interestedAreas", JSON.stringify(profile.interestedAreas));

      if (selectedImageFile) {
        formDataToSend.append("profilePic", selectedImageFile);
      }

      const res = await API.put(`profile/${userId}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Merge with existing user to preserve token
      const updatedUser = {
        ...user,
        ...res.data.user
      };

      // Update Auth Context with new user info
      login(updatedUser);
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing Profile...</p>
      </div>
    );
  }

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    setProfile({
      ...profile,
      interestedAreas: [...profile.interestedAreas, newInterest.trim()],
    });
    setNewInterest("");
  };

  const removeInterest = (index) => {
    const updated = [...profile.interestedAreas];
    updated.splice(index, 1);
    setProfile({ ...profile, interestedAreas: updated });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fafbff] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
            <button 
                onClick={() => navigate("/profile")}
                className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-500 hover:text-blue-600"
            >
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Edit Profile</h1>
            <div className="w-11" /> {/* Spacer */}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 p-10 border border-gray-50">
            
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-100 flex items-center justify-center">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <User size={56} className="text-gray-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white" size={32} />
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setSelectedImageFile(file);
                                    setImagePreview(URL.createObjectURL(file));
                                }
                            }}
                        />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg border-4 border-white pointer-events-none">
                        <Camera size={16} />
                    </div>
                </div>
                <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Update Photo</p>
            </div>

            <div className="space-y-6">
                {/* Name & Email (Disabled) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
                        <input
                            type="text"
                            value={profile.name}
                            disabled
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-500 font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-500 font-medium"
                        />
                    </div>
                </div>

                {/* DOB & Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 ml-1">Date of Birth</label>
                        <div className="relative">
                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="date"
                                value={profile.dob}
                                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 ml-1">Mobile Number</label>
                        <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="+1 (555) 000-0000"
                                value={profile.mobile}
                                onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Interests */}
                <div>
                    <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 ml-1">Interests & Skills</label>
                    
                    <div className="bg-gray-50 rounded-[2rem] p-6 mb-4 min-h-[100px]">
                        <div className="flex flex-wrap gap-2">
                            {profile.interestedAreas.map((area, idx) => (
                                <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    key={idx}
                                    className="bg-white text-gray-700 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 flex items-center gap-2 shadow-sm group"
                                >
                                    {area}
                                    <button
                                        onClick={() => removeInterest(idx)}
                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </motion.span>
                            ))}
                            {profile.interestedAreas.length === 0 && (
                                <p className="text-gray-400 text-sm italic py-2 ml-2">Add some interests to get better matches...</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                            <input
                                type="text"
                                placeholder="e.g. UX Design, AI, Fitness"
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                            />
                        </div>
                        <button
                            onClick={handleAddInterest}
                            className="bg-gray-900 text-white px-6 rounded-2xl font-bold hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-[2rem] shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none mt-6 flex items-center justify-center gap-3 text-lg"
                >
                    {saving ? (
                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save size={24} />
                            Save Profile Changes
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
