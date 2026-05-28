import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { 
  Video, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  PhoneCall, 
  History, 
  Plus,
  ShieldCheck,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StartCallModal from "../components/chat/StartCallModal";

const CallsDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const res = await API.get("calls/my-calls");
      setCalls(res.data || []);
    } catch (err) {
      console.error("Failed to fetch calls", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const handleRespond = async (callId, status) => {
    try {
      const res = await API.patch(`calls/${callId}/status`, { status });
      
      if (socket && res.data.notification) {
          socket.emit("notify_user", {
              recipientId: res.data.call.caller,
              notification: res.data.notification
          });
      }

      fetchCalls(); 
    } catch (err) {
      console.error("Failed to respond to call", err);
    }
  };

  const handleRemind = async (callId, recipientId) => {
    try {
        const res = await API.post(`calls/${callId}/remind`);
        if (socket && res.data) {
            socket.emit("notify_user", {
                recipientId,
                notification: res.data
            });
            alert("Reminder sent successfully!");
        }
    } catch (err) {
        console.error("Failed to send reminder", err);
    }
  };

  const upcomingCalls = calls.filter(c => c.status === "accepted" || c.status === "scheduled");
  const pendingInvitations = calls.filter(c => c.status === "pending" && (c.receiver?._id || c.receiver) === (user.id || user._id));
  const pastCalls = calls.filter(c => c.status === "completed" || c.status === "rejected" || c.status === "cancelled" || c.status === "missed");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] gap-6 bg-slate-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Accessing Secure Channels...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#f8fafc] relative overflow-x-hidden pb-20">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-slate-900 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-4"
            >
                <div className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-blue-600/20">
                    Communication
                </div>
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">• Real-time Uplink Hub</span>
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-[900] text-white tracking-tighter"
            >
                Secure <span className="text-blue-400 italic">Sessions</span>.
            </motion.h1>
          </div>

          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileActive={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-900/10 transition-all hover:bg-blue-50 hover:text-blue-600"
          >
            <Plus size={18} strokeWidth={3} /> Initialize New Node
          </motion.button>
        </header>

        <StartCallModal isOpen={isModalOpen} onClose={() => {
            setIsModalOpen(false);
            fetchCalls();
        }} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Upcoming / Active Section */}
              <section>
                <div className="flex items-center gap-6 mb-8">
                   <h2 className="text-[11px] font-black text-white/60 uppercase tracking-[0.3em]">Queued Sessions</h2>
                   <div className="h-px flex-1 bg-white/10" />
                </div>

                {upcomingCalls.length > 0 ? (
                  <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-6"
                  >
                    {upcomingCalls.map((call) => (
                      <CallCard 
                        key={call._id} 
                        call={call} 
                        currentUser={user} 
                        onRespond={handleRespond} 
                        onRemind={handleRemind}
                        isUpcoming 
                        variants={item} 
                      />
                    ))}
                  </motion.div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-16 border border-white/5 text-center shadow-inner">
                     <p className="text-slate-400 font-bold uppercase tracking-[0.1em] text-sm italic">No active uplinks queued.</p>
                  </div>
                )}
              </section>

              {/* History Section */}
              <section>
                <div className="flex items-center gap-6 mb-8">
                   <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Historical Archive</h2>
                   <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] overflow-hidden">
                   {pastCalls.length > 0 ? (
                     <div className="divide-y divide-slate-50">
                        {pastCalls.map((call) => (
                          <div key={call._id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                             <div className="flex items-center gap-6">
                                <UserAvatar user={(call.caller?._id || call.caller) === (user.id || user._id) ? call.receiver : call.caller} size="14" />
                                <div>
                                   <p className="font-[900] text-slate-900 group-hover:text-blue-600 transition-colors">{(call.caller?._id || call.caller) === (user.id || user._id) ? call.receiver?.name : call.caller?.name}</p>
                                   <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            {new Date(call.scheduledFor || call.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{call.callType}</p>
                                   </div>
                                </div>
                             </div>
                             <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border ${
                                 call.status === "completed" ? "bg-green-50 text-green-600 border-green-100" :
                                 call.status === "rejected" ? "bg-red-50 text-red-600 border-red-100" :
                                 "bg-slate-50 text-slate-400 border-slate-100"
                             }`}>
                                {call.status}
                             </div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="p-20 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <History className="text-slate-200" size={32} />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">Archive is currently empty.</p>
                     </div>
                   )}
                </div>
              </section>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-10">
               
               {/* Pending Invitations */}
               <section>
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-[11px] font-black text-white/60 uppercase tracking-[0.3em]">Inbound Invites</h2>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  {pendingInvitations.length > 0 ? (
                    <div className="space-y-5">
                       {pendingInvitations.map((call) => (
                         <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={call._id} 
                            className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group"
                         >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
                            
                            <div className="flex items-center gap-5 mb-8 relative z-10">
                               <UserAvatar user={call.caller} size="16" />
                               <div>
                                  <p className="text-lg font-[900] text-white leading-tight">{call.caller?.name}</p>
                                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mt-1">Pending Sync</p>
                               </div>
                            </div>
                            <div className="flex flex-col gap-3 relative z-10">
                               <button 
                                onClick={() => handleRespond(call._id, "accepted")}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                               >
                                  <Check size={14} strokeWidth={3} /> Accept Node
                               </button>
                               <button 
                                onClick={() => handleRespond(call._id, "rejected")}
                                className="w-full bg-white/5 text-white/40 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all active:scale-95"
                               >
                                  Decline
                               </button>
                            </div>
                         </motion.div>
                       ))}
                    </div>
                  ) : (
                    <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/5 text-center">
                       <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">Clear Grid</p>
                    </div>
                  )}
               </section>

               {/* Quick Tips */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.5 }}
                 className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[3.5rem] text-white shadow-[0_40px_80px_-15px_rgba(37,99,235,0.4)] relative overflow-hidden"
               >
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/graphy.png")' }} />
                  
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-xl border border-white/10">
                    <ShieldCheck size={28} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-[900] mb-3 tracking-tight">Security Protocol</h3>
                  <p className="text-blue-100 text-sm font-medium mb-10 leading-relaxed">Always verify your environment and link integrity before initiating high-bandwidth knowledge transfer.</p>
                  
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-80">
                        <div className="w-2 h-2 bg-green-400 rounded-full" /> Verified Nodes Only
                    </li>
                    <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-80">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" /> Encrypted Signaling
                    </li>
                  </ul>
               </motion.div>

            </div>

          </div>
      </div>
    </div>
  );
};

const UserAvatar = ({ user, size = "12" }) => (
    <div className={`w-${size} h-${size} relative flex-shrink-0`}>
        <div className="w-full h-full rounded-[1.5rem] overflow-hidden border-2 border-white shadow-xl ring-1 ring-slate-100 bg-white">
            {user?.profilePic ? (
                <img src={user.profilePic} className="w-full h-full object-cover" alt="" />
            ) : (
                <div className="w-full h-full bg-blue-50 text-blue-600 flex items-center justify-center font-[900] text-xl">
                    {user?.name?.charAt(0) || "U"}
                </div>
            )}
        </div>
    </div>
);

const CallCard = ({ call, currentUser, onRespond, onRemind, isUpcoming, variants }) => {
    const isCaller = (call.caller?._id || call.caller) === (currentUser.id || currentUser._id);
    const otherPerson = isCaller ? call.receiver : call.caller;
    const date = new Date(call.scheduledFor || call.createdAt);
    const navigate = useNavigate();

    return (
        <motion.div 
            variants={variants}
            whileHover={{ y: -8 }}
            className="bg-white p-10 rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all hover:border-blue-100 group"
        >
            <div className="flex items-center gap-8">
                <div className="relative">
                    <UserAvatar user={otherPerson} size="20" />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping opacity-30" />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-3xl font-[900] text-slate-900 leading-none tracking-tight group-hover:text-blue-600 transition-colors">{otherPerson?.name}</h3>
                        <div className="bg-blue-50 px-3 py-1 rounded-lg">
                            <ShieldCheck size={12} className="text-blue-600" strokeWidth={3} />
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                        <span className="flex items-center gap-2"><Calendar size={14} className="text-blue-500" strokeWidth={2.5} /> {date.toLocaleDateString()}</span>
                        <span className="flex items-center gap-2"><Clock size={14} className="text-blue-500" strokeWidth={2.5} /> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                {isUpcoming && (
                    <>
                    <button 
                        onClick={() => onRemind(call._id, otherPerson?._id)}
                        className="bg-slate-50 text-slate-400 px-6 py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95"
                    >
                        Send Reminder
                    </button>
                    <button 
                        onClick={() => navigate(`/call/${call.roomId}?receiverId=${otherPerson?._id}`)}
                        className="bg-slate-900 text-white px-10 py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/10 active:scale-95 group/btn"
                    >
                        <PhoneCall size={18} strokeWidth={3} className="group-hover/btn:rotate-12 transition-transform" /> Join Session
                    </button>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default CallsDashboard;
