import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Plus, Hash, Users, Sparkles, ArrowRight, Search, Zap, Globe, MessageSquare, ShieldCheck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CreateGroupModal from '../chat/CreateGroupModal';

const RoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await API.get("chat/discover");
            setRooms(res.data || []);
        } catch (err) {
            console.error("Error fetching rooms:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleJoinRoom = async (roomId) => {
        try {
            await API.post(`chat/join/${roomId}`);
            navigate(`/interest-chat/${roomId}`);
        } catch (err) {
            console.error("Failed to join room", err);
        }
    };

    const filteredRooms = rooms.filter(room => 
        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.topic?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] gap-6 bg-slate-50">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Accessing Distributed Clusters...</p>
          </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-73px)] bg-[#f8fafc] relative overflow-x-hidden pb-20">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/20 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4" />

            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
                    <div className="max-w-xl">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-4"
                        >
                            <div className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-blue-600/20">
                                Distributed Labs
                            </div>
                            <span className="text-slate-400 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                                <Globe size={12} className="text-blue-500" /> Active Ecosystem
                            </span>
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-6xl font-[900] text-slate-900 tracking-tighter leading-[1.1]"
                        >
                            Knowledge <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Clusters</span>.
                        </motion.h1>
                        <p className="text-slate-500 mt-6 text-xl font-medium leading-relaxed">Discover high-bandwidth communities and participate in collective expertise transfer. Filter by domain or deploy a new node.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full sm:w-80 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input 
                                type="text"
                                placeholder="Search clusters..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[1.8rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.03)] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300"
                            />
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-10 py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-900/10 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={20} strokeWidth={3} /> Deploy Node
                        </button>
                    </div>
                </div>

                <CreateGroupModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onCreated={(newRoom) => navigate(`/interest-chat/${newRoom._id}`)} 
                />

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence mode="popLayout">
                        {filteredRooms.map((room, index) => (
                            <motion.div
                                layout
                                key={room._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                                className="bg-white rounded-[3.5rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-50 hover:border-blue-100 transition-all duration-500 group relative overflow-hidden flex flex-col h-full"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-[1.8rem] flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-500 shadow-inner">
                                            <Hash size={32} strokeWidth={2.5} />
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                                <Users size={12} strokeWidth={3} /> Capacity
                                            </div>
                                            <p className="text-lg font-[900] text-slate-900 leading-none">{room.members?.length || 0}</p>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-2xl font-[900] text-slate-900 mb-4 tracking-tight group-hover:text-blue-600 transition-colors leading-tight">{room.name}</h3>
                                    
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        <div className="px-4 py-1.5 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl border border-slate-100">
                                            {room.topic || "General"}
                                        </div>
                                        <div className="px-4 py-1.5 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl border border-green-100 flex items-center gap-1.5">
                                            <Activity size={10} strokeWidth={3} /> Active
                                        </div>
                                    </div>

                                    <div className="space-y-5 mb-10 flex-1">
                                        {room.skillOffered && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-yellow-100">
                                                    <Zap size={16} className="text-yellow-500" fill="currentColor" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Output Streams</p>
                                                    <p className="text-sm text-slate-600 font-bold leading-relaxed">{room.skillOffered}</p>
                                                </div>
                                            </div>
                                        )}
                                        {room.skillDesired && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-100">
                                                    <Sparkles size={16} className="text-purple-500" fill="currentColor" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Inbound Requirements</p>
                                                    <p className="text-sm text-slate-600 font-bold leading-relaxed">{room.skillDesired}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => handleJoinRoom(room._id)}
                                        className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[1.8rem] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all duration-500 shadow-2xl shadow-slate-900/10 active:scale-95 group/btn"
                                    >
                                        Establish Uplink <ArrowRight size={18} strokeWidth={3} className="group-hover/btn:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredRooms.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full py-32 text-center bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-inner flex flex-col items-center px-10"
                        >
                            <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100">
                                <Search size={48} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-3xl font-[900] text-slate-900 tracking-tight mb-4">No Matching Clusters</h3>
                            <p className="text-slate-500 font-medium max-w-md mx-auto mb-12 text-lg leading-relaxed">We couldn't locate any active communities matching your query. Initiate a new node to lead the domain.</p>
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="text-blue-600 font-black uppercase tracking-[0.2em] text-[11px] hover:text-indigo-600 transition-all flex items-center gap-3 border-b-2 border-blue-100 pb-1"
                            >
                                <Zap size={14} strokeWidth={3} /> Clear Parameters
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomsPage;
