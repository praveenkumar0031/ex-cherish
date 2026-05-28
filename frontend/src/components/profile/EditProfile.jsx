import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, X, Plus, Save, ArrowLeft, User, Phone, Calendar, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    bio: "",
    tags: [],
    categories: [],
    interestedAreas: [],
    profilePic: "",
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [newInterest, setNewInterest] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newCategory, setNewCategory] = useState("");
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
        const res = await API.get(`users/${userId}`);
        let data = res.data;
        
        // Data sanitization
        const sanitizeArray = (arr) => {
            if (typeof arr === "string") {
                try { return JSON.parse(arr); } catch { return []; }
            }
            return Array.isArray(arr) ? arr : [];
        };

        data.interestedAreas = sanitizeArray(data.interestedAreas);
        data.tags = sanitizeArray(data.tags);
        data.categories = sanitizeArray(data.categories);

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
      formDataToSend.append("bio", profile.bio || "");
      formDataToSend.append("interestedAreas", JSON.stringify(profile.interestedAreas));
      formDataToSend.append("tags", JSON.stringify(profile.tags));
      formDataToSend.append("categories", JSON.stringify(profile.categories));

      if (selectedImageFile) {
        formDataToSend.append("profilePic", selectedImageFile);
      }

      const res = await API.put(`users/${userId}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Merge with existing user to preserve token
      const updatedUser = {
        ...user,
        ...res.data.user
      };

      login(updatedUser);
      navigate("/profile");
    } catch (err) {
      console.error("Save profile error:", err);
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    if (profile.interestedAreas.includes(newInterest.trim())) {
        setNewInterest("");
        return;
    }
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

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (profile.tags.includes(newTag.trim())) {
        setNewTag("");
        return;
    }
    setProfile({ ...profile, tags: [...profile.tags, newTag.trim()] });
    setNewTag("");
  };

  const removeTag = (index) => {
    const updated = [...profile.tags];
    updated.splice(index, 1);
    setProfile({ ...profile, tags: updated });
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (profile.categories.includes(newCategory.trim())) {
        setNewCategory("");
        return;
    }
    setProfile({ ...profile, categories: [...profile.categories, newCategory.trim()] });
    setNewCategory("");
  };

  const removeCategory = (index) => {
    const updated = [...profile.categories];
    updated.splice(index, 1);
    setProfile({ ...profile, categories: updated });
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] gap-6 bg-slate-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Establishing Secure Sync...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 relative overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-slate-900">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-16 pb-20 relative z-10">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
            <button 
                onClick={() => navigate("/profile")}
                className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl transition-all text-white font-bold text-sm"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Return to Profile
            </button>
            <div className="flex flex-col items-end">
                <span className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">Data Portal</span>
                <h1 className="text-2xl font-[900] text-white tracking-tight">Modify Identity</h1>
            </div>
        </div>

        <div className="bg-white rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
            
            {/* Upper Section: Avatar Update */}
            <div className="bg-slate-50/50 p-12 flex flex-col items-center border-b border-slate-100 relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
                
                <div className="relative group z-10">
                    <div className="w-36 h-36 rounded-[3.5rem] overflow-hidden border-8 border-white shadow-2xl ring-1 ring-slate-200 bg-white flex items-center justify-center relative">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <User size={64} className="text-slate-200" strokeWidth={1.5} />
                        )}
                        
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <Camera className="text-white" size={32} />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Update Node</span>
                            </div>
                        </div>
                        
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setSelectedImageFile(file);
                                    setImagePreview(URL.createObjectURL(file));
                                }
                            }}
                        />
                    </div>
                    <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-xl border-4 border-white pointer-events-none"
                    >
                        <Camera size={18} strokeWidth={2.5} />
                    </motion.div>
                </div>
                <div className="mt-6 text-center">
                    <p className="text-slate-900 font-[900] text-lg leading-tight">{profile.name}</p>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{profile.email}</p>
                </div>
            </div>

            <div className="p-12 space-y-10">
                
                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                            <Calendar size={12} className="text-blue-500" /> Origin Date
                        </label>
                        <input
                            type="date"
                            value={profile.dob}
                            onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-[700] text-slate-700"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                            <Phone size={12} className="text-blue-500" /> Direct Protocol
                        </label>
                        <input
                            type="text"
                            placeholder="+1 (000) 000-0000"
                            value={profile.mobile}
                            onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-[700] text-slate-700 placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Bio Section */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                        <User size={12} className="text-blue-500" /> Professional Bio
                    </label>
                    <textarea
                        placeholder="Tell the community about your expertise and goals..."
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300 resize-none"
                    />
                </div>

                {/* Expertise Domains */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <Sparkles size={12} className="text-indigo-500" /> Knowledge Domains
                        </label>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{profile.interestedAreas.length} Active</span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100/50 min-h-[120px] flex flex-wrap gap-3 items-start content-start transition-all">
                        <AnimatePresence>
                            {profile.interestedAreas.map((area, idx) => (
                                <motion.span
                                    layout
                                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.8, opacity: 0, x: -10 }}
                                    key={`interest-${idx}`}
                                    className="bg-white text-slate-700 pl-5 pr-3 py-3 rounded-2xl text-xs font-[800] border border-slate-200 flex items-center gap-3 shadow-sm hover:border-red-200 group transition-all"
                                >
                                    {area}
                                    <button
                                        onClick={() => removeInterest(idx)}
                                        className="w-6 h-6 rounded-lg bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                                    >
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                </motion.span>
                            ))}
                        </AnimatePresence>
                        {profile.interestedAreas.length === 0 && (
                            <div className="w-full py-6 text-center text-slate-400 font-bold text-xs italic opacity-60">Add nodes to optimize matching compatibility.</div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                placeholder="Add skill (e.g. AI, Physics, Design)"
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                            />
                        </div>
                        <button
                            onClick={handleAddInterest}
                            className="bg-slate-900 text-white px-8 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center shadow-xl shadow-slate-900/10"
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Tags Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <Sparkles size={12} className="text-blue-500" /> Identity Tags
                        </label>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{profile.tags.length} Active</span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100/50 min-h-[100px] flex flex-wrap gap-3 items-start content-start transition-all">
                        <AnimatePresence>
                            {profile.tags.map((tag, idx) => (
                                <motion.span
                                    layout
                                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.8, opacity: 0, x: -10 }}
                                    key={`tag-${idx}`}
                                    className="bg-white text-slate-700 pl-5 pr-3 py-3 rounded-2xl text-xs font-[800] border border-slate-200 flex items-center gap-3 shadow-sm hover:border-red-200 group transition-all"
                                >
                                    #{tag}
                                    <button
                                        onClick={() => removeTag(idx)}
                                        className="w-6 h-6 rounded-lg bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                                    >
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                </motion.span>
                            ))}
                        </AnimatePresence>
                        {profile.tags.length === 0 && (
                            <div className="w-full py-4 text-center text-slate-400 font-bold text-xs italic opacity-60">Add tags like #engineer, #mentor, #founder...</div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Plus className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                placeholder="Add tag..."
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                            />
                        </div>
                        <button
                            onClick={handleAddTag}
                            className="bg-slate-900 text-white px-8 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center shadow-xl shadow-slate-900/10"
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Categories Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <Sparkles size={12} className="text-green-500" /> Focus Categories
                        </label>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{profile.categories.length} Active</span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100/50 min-h-[100px] flex flex-wrap gap-3 items-start content-start transition-all">
                        <AnimatePresence>
                            {profile.categories.map((cat, idx) => (
                                <motion.span
                                    layout
                                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.8, opacity: 0, x: -10 }}
                                    key={`cat-${idx}`}
                                    className="bg-white text-slate-700 pl-5 pr-3 py-3 rounded-2xl text-xs font-[800] border border-slate-200 flex items-center gap-3 shadow-sm hover:border-red-200 group transition-all"
                                >
                                    {cat}
                                    <button
                                        onClick={() => removeCategory(idx)}
                                        className="w-6 h-6 rounded-lg bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                                    >
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                </motion.span>
                            ))}
                        </AnimatePresence>
                        {profile.categories.length === 0 && (
                            <div className="w-full py-4 text-center text-slate-400 font-bold text-xs italic opacity-60">Add categories like AI, Blockchain, Art...</div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Plus className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                placeholder="Add category..."
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                            />
                        </div>
                        <button
                            onClick={handleAddCategory}
                            className="bg-slate-900 text-white px-8 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center shadow-xl shadow-slate-900/10"
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-6">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none flex items-center justify-center gap-4 text-[12px] uppercase tracking-[0.3em]"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Encrypting Data...</span>
                            </>
                        ) : (
                            <>
                                <Save size={20} strokeWidth={2.5} />
                                <span>Finalize Profile Updates</span>
                            </>
                        )}
                    </button>
                    <p className="text-center mt-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <ShieldCheck size={14} className="text-green-500" /> Changes verified by secure session
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
