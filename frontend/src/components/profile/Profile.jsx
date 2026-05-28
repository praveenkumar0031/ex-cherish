import React, { useEffect, useState } from "react";
import { User, Calendar, Phone, Star, Coins, Edit3, ShieldCheck, Mail, MapPin, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id && !user?._id) return;
      
      try {
        setLoading(true);
        const userId = user.id || user._id;
        const res = await API.get(`users/${userId}`);
        
        let data = res.data;
        // Data cleaning
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
        setError(null);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Unable to sync profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] gap-6 bg-slate-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Loading Profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] p-8 text-center bg-slate-50">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-red-900/5 border border-red-100">
          <AlertCircle size={48} strokeWidth={2.5} />
        </div>
        <h3 className="text-3xl font-[900] text-slate-900 tracking-tight">Sync Failure</h3>
        <p className="text-slate-500 mt-3 mb-10 max-w-xs font-medium">{error || "Something went wrong while fetching your data."}</p>
        <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-full shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
        >
            Retry Connection
        </button>
      </div>
    );
  }

  const filledFields = ["dob", "mobile", "bio", "tags", "categories", "interestedAreas", "profilePic"].filter(
    (f) => profile[f] && (Array.isArray(profile[f]) ? profile[f].length > 0 : true)
  ).length;

  const completion = Math.round((filledFields / 7) * 100);
  const creditValue = Number(profile.credit) || 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 relative overflow-x-hidden">
      
      {/* Background Hero */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-slate-900 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative z-10">
        
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col lg:flex-row gap-10 items-start"
        >
          
          {/* LEFT COLUMN: PRIMARY INFO */}
          <motion.div variants={item} className="w-full lg:w-[400px] space-y-6 lg:sticky lg:top-[100px]">
            
            {/* Identity Card */}
            <div className="bg-white rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] p-10 flex flex-col items-center border border-slate-100">
                <div className="relative mb-8 group">
                    <div className="w-40 h-40 rounded-[3.5rem] overflow-hidden border-8 border-slate-50 shadow-2xl ring-1 ring-slate-200 transition-transform duration-500 group-hover:scale-[1.02]">
                        {profile.profilePic ? (
                        <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                        <div className="bg-slate-50 w-full h-full flex items-center justify-center">
                            <User className="text-slate-200" size={72} strokeWidth={1.5} />
                        </div>
                        )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-ping opacity-30" />
                    </div>
                </div>

                <h2 className="text-3xl font-[900] text-slate-900 text-center tracking-tight mb-1">{profile.name}</h2>
                <p className="text-blue-600 font-[800] text-[10px] uppercase tracking-[0.2em] mb-8 flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full">
                    <ShieldCheck size={14} strokeWidth={3} /> Verified Member
                </p>

                <div className="w-full space-y-4">
                    <div className="bg-slate-50/80 rounded-3xl p-6 flex items-center justify-between border border-slate-100/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm border border-slate-100">
                                <Coins size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Knowledge Credits</span>
                        </div>
                        <span className="text-2xl font-[900] text-slate-900">{creditValue.toFixed(0)}</span>
                    </div>

                    <button 
                        onClick={() => navigate("/edit-profile")}
                        className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/10 active:scale-95"
                    >
                        <Edit3 size={16} strokeWidth={3} /> Edit My Profile
                    </button>
                </div>
            </div>

            {/* Profile Health */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-900/5 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Profile Completion</h4>
                    <span className="text-lg font-[900] text-blue-600">{completion}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4 p-0.5 border border-slate-100 shadow-inner">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${completion}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
                    />
                </div>
                <p className="text-slate-400 text-[11px] font-bold leading-relaxed">Complete your profile to unlock premium matching and higher compatibility scores.</p>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: DETAILS */}
          <div className="flex-1 space-y-8 w-full">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={item} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:border-blue-100 transition-all group">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Mail size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email System</p>
                            <p className="text-lg font-[800] text-slate-900 truncate max-w-[200px]">{profile.email}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:border-green-100 transition-all group">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Phone size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Line</p>
                            <p className="text-lg font-[800] text-slate-900">{profile.mobile || "Unspecified"}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bio Section */}
            <motion.div variants={item} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User size={12} className="text-blue-500" /> Professional Identity
                </p>
                <p className="text-slate-700 font-medium leading-relaxed italic">
                    "{profile.bio || "No professional biography provided yet. Update your profile to tell the community about yourself."}"
                </p>
            </motion.div>

            {/* Knowledge Domains / Interests */}
            <motion.div 
              variants={item}
              className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-slate-100 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                                <Sparkles size={28} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-3xl font-[900] text-slate-900 tracking-tight">Expertise Domains</h3>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {profile.interestedAreas.length > 0 ? (
                            profile.interestedAreas.map((area, idx) => (
                            <motion.span
                                whileHover={{ scale: 1.05, y: -2 }}
                                key={idx}
                                className="bg-slate-50 text-slate-700 px-8 py-4 rounded-[1.5rem] text-sm font-[800] border border-slate-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-xl hover:shadow-blue-900/10 transition-all cursor-default"
                            >
                                {area}
                            </motion.span>
                            ))
                        ) : (
                            <div className="py-10 text-center w-full bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold text-xs italic">No expertise domains identified.</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Tags & Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div variants={item} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Identity Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {profile.tags?.length > 0 ? (
                            profile.tags.map((tag, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-blue-100">
                                    #{tag}
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-300 text-[10px] font-bold italic">No tags.</span>
                        )}
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Focus Categories</h4>
                    <div className="flex flex-wrap gap-2">
                        {profile.categories?.length > 0 ? (
                            profile.categories.map((cat, idx) => (
                                <span key={idx} className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-green-100">
                                    {cat}
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-300 text-[10px] font-bold italic">No categories.</span>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Additional Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div variants={item} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex items-center gap-8 group">
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                        <Calendar size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Elapsed</p>
                        <p className="text-xl font-[900] text-slate-900">{profile.dob || "Date Missing"}</p>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex items-center gap-8 group">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                        <MapPin size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Presence</p>
                        <p className="text-xl font-[900] text-slate-900">Active Node</p>
                    </div>
                </motion.div>
            </div>

          </div>

        </motion.div>

      </div>
    </div>
  );
};

export default Profile;
