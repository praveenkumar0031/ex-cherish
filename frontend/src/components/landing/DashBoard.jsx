import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Users, Sparkles, Video, Search, Zap, ArrowRight, Heart } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    rooms: 0,
    matches: 0,
    connections: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [roomsRes, matchesRes] = await Promise.all([
          API.get("rooms/my-chats"),
          API.get("matches/my-matches")
        ]);
        
        const rooms = roomsRes.data || [];
        const matches = matchesRes.data || [];
        
        setStats({
          rooms: rooms.filter(r => r.isGroup).length,
          matches: matches.filter(m => m.status === "matched").length,
          connections: matches.length // includes matched, liked_you, etc.
        });
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      }
    };
    fetchDashboardData();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fafbff] relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/50 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
              Personal Hub
            </div>
            <span className="text-gray-400 font-medium text-sm">• {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 leading-tight"
          >
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.name?.split(' ')[0]}</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 mt-3 text-lg font-medium"
          >
            Your network is growing. Here's what's happening today.
          </motion.p>
        </header>

        {/* Stats Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <motion.div variants={item} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500">
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Active Matches</p>
              <h3 className="text-4xl font-black text-gray-900">{stats.matches}</h3>
            </div>
            <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart size={28} fill="currentColor" />
            </div>
          </motion.div>

          <motion.div variants={item} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500">
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Interest Groups</p>
              <h3 className="text-4xl font-black text-gray-900">{stats.rooms}</h3>
            </div>
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
          </motion.div>

          <motion.div variants={item} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500">
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Connections</p>
              <h3 className="text-4xl font-black text-gray-900">{stats.connections}</h3>
            </div>
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quick Actions</h2>
            <div className="h-px flex-1 bg-gray-100 mx-8" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <motion.div 
              whileHover={{ y: -8 }}
              onClick={() => navigate("/discover")}
              className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-black mb-2">Discover</h3>
              <p className="text-blue-100 text-sm font-medium mb-8">Find people with similar interests and start connecting.</p>
              <div className="flex items-center gap-2 text-sm font-black group-hover:gap-4 transition-all uppercase tracking-widest">
                Explore <ArrowRight size={16} />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8 }}
              onClick={() => navigate("/rooms")}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 cursor-pointer group hover:border-indigo-100 transition-all"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">My Chats</h3>
              <p className="text-gray-500 text-sm font-medium mb-8">Continue your conversations in private and group chats.</p>
              <div className="flex items-center gap-2 text-sm font-black text-indigo-600 group-hover:gap-4 transition-all uppercase tracking-widest">
                Open Messenger <ArrowRight size={16} />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8 }}
              onClick={() => navigate("/rooms")}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 cursor-pointer group hover:border-purple-100 transition-all"
            >
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Skill Swap</h3>
              <p className="text-gray-500 text-sm font-medium mb-8">Join interest groups and share your expertise with others.</p>
              <div className="flex items-center gap-2 text-sm font-black text-purple-600 group-hover:gap-4 transition-all uppercase tracking-widest">
                Join Groups <ArrowRight size={16} />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8 }}
              onClick={() => navigate("/profile")}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 cursor-pointer group hover:border-gray-300 transition-all"
            >
              <div className="w-12 h-12 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">My Profile</h3>
              <p className="text-gray-500 text-sm font-medium mb-8">Keep your profile updated to get better recommendations.</p>
              <div className="flex items-center gap-2 text-sm font-black text-gray-900 group-hover:gap-4 transition-all uppercase tracking-widest">
                Manage Profile <ArrowRight size={16} />
              </div>
            </motion.div>

          </div>
        </section>
      </div>

      <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Sparkles className="text-white" size={16} />
              </div>
              <span className="font-black text-gray-900 uppercase tracking-tighter">Excherish</span>
           </div>
           <p className="text-gray-400 text-sm font-medium">© {new Date().getFullYear()} EXCHERISH. Built for the modern network.</p>
           <div className="flex gap-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
           </div>
        </div>
      </footer>

    </div>
  );
};

export default Dashboard;
