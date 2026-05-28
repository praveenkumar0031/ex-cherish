import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Hash, FileText, Camera, Sparkles, Globe, ShieldCheck } from "lucide-react";
import API from "../../services/api";

const CreateGroupModal = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("chat/create", formData);
      onCreated(res.data.room);
      onClose();
    } catch (err) {
      console.error("Failed to create group", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Immersive Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Premium Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-lg bg-white rounded-[3.5rem] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-100"
          >
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                    <Users size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-[900] text-slate-900 tracking-tight">Deploy Cluster</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Initialize New Node</p>
                  </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                <X size={20} className="text-slate-400" strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {/* Profile Config */}
              <div className="flex justify-center mb-4">
                <div className="relative group cursor-pointer">
                  <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 border-4 border-dashed border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all duration-500 shadow-inner">
                    <Camera size={32} strokeWidth={1.5} />
                  </div>
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -bottom-1 -right-1 bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border-4 border-white"
                  >
                    <Hash size={14} strokeWidth={3} />
                  </motion.div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Cluster Designation</label>
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      className="w-full pl-6 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300"
                      placeholder="e.g. Quantum Computing Lab"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Domain Topic</label>
                        <input
                            type="text"
                            required
                            className="w-full pl-6 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300"
                            placeholder="e.g. Science"
                            value={formData.topic}
                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Access Type</label>
                        <div className="w-full pl-6 pr-6 py-5 bg-slate-100/50 border border-slate-100 rounded-[1.8rem] font-bold text-slate-400 text-sm flex items-center gap-3">
                            <ShieldCheck size={16} /> Public Node
                        </div>
                    </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Mission Briefing</label>
                  <textarea
                    required
                    className="w-full pl-6 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300 min-h-[120px] resize-none"
                    placeholder="Define the primary objectives of this cluster..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.3em]"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Synchronizing...</span>
                        </>
                    ) : (
                        <>
                            <Globe size={18} strokeWidth={2.5} />
                            <span>Deploy Node to Grid</span>
                        </>
                    )}
                </button>
                <p className="text-center mt-6 text-slate-400 text-[9px] font-black uppercase tracking-widest">By deploying, you agree to follow the collective protocol.</p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;
