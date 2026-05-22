import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Plus, Hash, Users, Sparkles, ArrowRight, Search, Zap } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CreateGroupModal from '../chat/CreateGroupModal';

const RoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const fetchRooms = async () => {
        try {
            const res = await API.get("rooms/discover");
            setRooms(res.data);
        } catch (err) {
            console.error("Error fetching rooms:", err);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleJoinRoom = async (roomId) => {
        try {
            await API.post(`rooms/join/${roomId}`);
            navigate(`/interest-chat/${roomId}`);
        } catch (err) {
            console.error("Failed to join room", err);
        }
    };

    const filteredRooms = rooms.filter(room => 
        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.topic?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#fafbff] p-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black text-gray-900 tracking-tight"
                        >
                            Interest <span className="text-blue-600">Groups</span>
                        </motion.h1>
                        <p className="text-gray-500 mt-2 font-medium">Discover communities and share your skills.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Search groups..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all w-full md:w-64"
                            />
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={20} /> Create Group
                        </button>
                    </div>
                </div>

                <CreateGroupModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onCreated={(newRoom) => navigate(`/interest-chat/${newRoom._id}`)} 
                />

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredRooms.map((room, index) => (
                        <motion.div
                            key={room._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 hover:shadow-xl hover:shadow-blue-900/5 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:bg-blue-100 transition-colors" />
                            
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Hash size={28} />
                                </div>
                                
                                <h3 className="text-2xl font-black text-gray-900 mb-2 truncate">{room.name}</h3>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                        {room.topic || "General"}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold">
                                        <Users size={14} /> {room.members?.length || 0} Members
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {room.skillOffered && (
                                        <div className="flex items-start gap-2">
                                            <Zap size={14} className="text-yellow-500 mt-0.5" />
                                            <p className="text-sm text-gray-600"><span className="font-bold text-gray-900">Offers:</span> {room.skillOffered}</p>
                                        </div>
                                    )}
                                    {room.skillDesired && (
                                        <div className="flex items-start gap-2">
                                            <Sparkles size={14} className="text-purple-500 mt-0.5" />
                                            <p className="text-sm text-gray-600"><span className="font-bold text-gray-900">Wants:</span> {room.skillDesired}</p>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={() => handleJoinRoom(room._id)}
                                    className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all group/btn"
                                >
                                    Join Community <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {filteredRooms.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">No groups found</h3>
                            <p className="text-gray-500 mt-2 mb-8">Try searching for something else or create your own group!</p>
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="text-blue-600 font-black uppercase tracking-widest text-xs hover:underline"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomsPage;
