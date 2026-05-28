import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Users, Sparkles, Video, Search, Zap, ArrowRight, Heart, Bell, Calendar, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [roomsRes, matchesRes] = await Promise.all([
          API.get("chat/my-chats"),
          API.get("matches/my-matches")
        ]);
        
        const rooms = roomsRes.data || [];
        const matches = matchesRes.data || [];
        
        setStats({
          rooms: rooms.filter(r => r.isGroup).length,
          matches: matches.filter(m => m.status === "matched").length,
          connections: matches.length
        });
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] gap-6 bg-slate-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Syncing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#f8fafc] relative overflow-x-hidden pb-20">
      
      {/* Premium Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/30 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3" />
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="px-4 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl shadow-slate-900/10">
                Network Command
              </div>
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} className="text-blue-500" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-[900] text-slate-900 leading-[1.1] tracking-tighter"
            >
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Operational</span>.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 mt-6 text-xl font-medium leading-relaxed"
            >
              Welcome back, <span className="text-slate-900 font-bold">{user?.name?.split(' ')[0]}</span>. Your collaborative network is scaling. Explore new nodes and finalize pending syncs.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-slate-900/5 border border-slate-100"
          >
             <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
                {user?.profilePic ? (
                    <img src={user.profilePic} className="w-full h-full object-cover" alt=""/>
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><User size={24}/></div>
                )}
             </div>
             <div className="pr-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Session</p>
                <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                    Verified Node <ShieldCheck size={14} className="text-green-500" />
                </p>
             </div>
          </motion.div>
        </header>

        {/* Stats Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          <StatsCard 
            variants={item}
            label="Reciprocal Matches" 
            value={stats.matches} 
            icon={Heart} 
            color="pink" 
            trend="+12% sync rate"
          />
          <StatsCard 
            variants={item}
            label="Knowledge Groups" 
            value={stats.rooms} 
            icon={Users} 
            color="indigo" 
            trend="Active clusters"
          />
          <StatsCard 
            variants={item}
            label="Total Node Connections" 
            value={stats.connections} 
            icon={Zap} 
            color="blue" 
            trend="Stable latency"
          />
        </motion.div>

        {/* Action Matrix */}
        <section>
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] whitespace-nowrap">Core Operations</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ActionCard 
                onClick={() => navigate("/discover")}
                icon={Search}
                title="Discovery"
                desc="Algorithmically find new knowledge partners."
                primary
            />
            <ActionCard 
                onClick={() => navigate("/rooms")}
                icon={MessageSquare}
                title="Messenger"
                desc="High-bandwidth secure communication."
            />
            <ActionCard 
                onClick={() => navigate("/rooms")}
                icon={Zap}
                title="Skill Swap"
                desc="Initiate expertise transfer protocols."
            />
            <ActionCard 
                onClick={() => navigate("/profile")}
                icon={Sparkles}
                title="Identity"
                desc="Manage your global network presence."
            />
          </div>
        </section>
      </div>

      <footer className="bg-white/50 backdrop-blur-md border-t border-slate-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-xl">
                <Sparkles className="text-white" size={18} />
              </div>
              <span className="font-[900] text-slate-900 uppercase tracking-tighter text-xl">Excherish</span>
           </div>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© {new Date().getFullYear()} EXCHERISH OS. All rights reserved.</p>
           <div className="flex gap-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-blue-600 transition-colors">Security</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Protocol</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Uplink</a>
           </div>
        </div>
      </footer>

    </div>
  );
};

const StatsCard = ({ label, value, icon: Icon, color, trend, variants }) => {
    const colorMap = {
        pink: "bg-pink-50 text-pink-500",
        indigo: "bg-indigo-50 text-indigo-600",
        blue: "bg-blue-50 text-blue-600"
    };

    return (
        <motion.div 
            variants={variants}
            className="bg-white p-10 rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] border border-slate-100 group hover:border-blue-200 transition-all duration-500"
        >
            <div className="flex items-start justify-between mb-8">
                <div className={`w-16 h-16 ${colorMap[color]} rounded-[1.8rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                    <Icon size={32} strokeWidth={2.5} />
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Status</p>
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5 justify-end">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                    </span>
                </div>
            </div>
            <div>
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-2">{label}</p>
              <h3 className="text-5xl font-[900] text-slate-900 tracking-tighter">{value}</h3>
              <p className="text-slate-400 text-[10px] font-bold mt-4 flex items-center gap-2 italic">
                  Node Trend: <span className="text-blue-600 not-italic font-black">{trend}</span>
              </p>
            </div>
        </motion.div>
    );
};

const ActionCard = ({ icon: Icon, title, desc, onClick, primary = false }) => {
    return (
        <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={onClick}
            className={`p-10 rounded-[3rem] cursor-pointer group transition-all duration-500 relative overflow-hidden shadow-2xl shadow-transparent hover:shadow-slate-900/10 ${
                primary 
                ? "bg-slate-900 text-white" 
                : "bg-white text-slate-900 border border-slate-100 hover:border-blue-100"
            }`}
        >
            {primary && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
            )}
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 shadow-inner ${
                primary ? "bg-white/10 text-white group-hover:bg-blue-600" : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"
            }`}>
                <Icon size={28} strokeWidth={2.5} />
            </div>
            
            <h3 className="text-2xl font-[900] tracking-tight mb-3 group-hover:text-blue-500 transition-colors">{title}</h3>
            <p className={`text-sm font-medium mb-10 leading-relaxed ${primary ? "text-slate-400" : "text-slate-500"}`}>
                {desc}
            </p>
            
            <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                primary ? "text-white group-hover:gap-6" : "text-blue-600 group-hover:gap-6"
            }`}>
                Connect <ArrowRight size={16} strokeWidth={3} />
            </div>
        </motion.div>
    );
};

export default Dashboard;
