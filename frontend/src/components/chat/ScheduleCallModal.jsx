import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Video, Sparkles, CheckCircle2 } from "lucide-react";
import API from "../../services/api";
import { useSocket } from "../../context/SocketContext";

const ScheduleCallModal = ({ isOpen, onClose, receiverId, receiverName }) => {
  const socket = useSocket();
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduledAt) return;
    
    setLoading(true);
    try {
      const res = await API.post("calls/schedule", {
        receiverId,
        scheduledFor: scheduledAt,
      });

      if (socket && res.data.notification) {
          socket.emit("notify_user", {
              recipientId: receiverId,
              notification: res.data.notification
          });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error("Failed to schedule call", err);
      alert(err.response?.data?.message || "Failed to schedule call");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Video size={24} />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight">Schedule Call</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {success ? (
              <div className="text-center py-12">
                <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100"
                >
                  <CheckCircle2 size={56} />
                </motion.div>
                <h4 className="text-2xl font-black text-gray-900 mb-2">Perfectly Timed!</h4>
                <p className="text-gray-500 font-medium">Your invitation has been sent to <span className="text-blue-600 font-bold">{receiverName}</span>.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="p-6 bg-[#fcfdff] rounded-3xl border border-blue-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/30 rounded-full -mr-12 -mt-12 blur-2xl" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                        <Sparkles size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Session Partner</p>
                        <p className="text-lg font-black text-gray-900">{receiverName}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Select Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-700"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !scheduledAt}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-3xl shadow-2xl shadow-blue-200 transition-all active:scale-95 disabled:bg-gray-200 disabled:shadow-none text-lg uppercase tracking-widest"
                >
                  {loading ? "Sending..." : "Confirm Invitation"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ScheduleCallModal;
