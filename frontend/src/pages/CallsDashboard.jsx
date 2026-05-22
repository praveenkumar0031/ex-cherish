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
  User, 
  PhoneCall, 
  History, 
  Timer,
  AlertCircle,
  Plus
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
      const res = await API.put(`calls/${callId}/respond`, { status });
      
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

  const upcomingCalls = calls.filter(c => c.status === "accepted" && new Date(c.scheduledAt) > new Date());
  const pendingInvitations = calls.filter(c => c.status === "pending" && (c.receiver?._id || c.receiver) === (user.id || user._id));
  const pastCalls = calls.filter(c => c.status === "completed" || c.status === "rejected" || c.status === "cancelled" || (c.status === "accepted" && new Date(c.scheduledAt) < new Date()));

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-50 text-yellow-600 border-yellow-100";
      case "accepted": return "bg-green-50 text-green-600 border-green-100";
      case "rejected": return "bg-red-50 text-red-600 border-red-100";
      case "completed": return "bg-blue-50 text-blue-600 border-blue-100";
      default: return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fafbff] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-2"
            >
                <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-100">
                Communication
                </div>
                <span className="text-gray-400 font-medium text-sm">• Video & Calls Hub</span>
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight"
            >
                Calls <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dashboard</span>
            </motion.h1>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-gray-900/10 active:scale-95"
          >
            <Plus size={20} /> New Call
          </button>
        </header>

        <StartCallModal isOpen={isModalOpen} onClose={() => {
            setIsModalOpen(false);
            fetchCalls();
        }} />

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Upcoming / Active Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <Clock size={20} />
                   </div>
                   <h2 className="text-xl font-black text-gray-800">Upcoming Sessions</h2>
                </div>

                {upcomingCalls.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {upcomingCalls.map((call) => (
                      <CallCard key={call._id} call={call} currentUser={user} onRespond={handleRespond} isUpcoming />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-[2rem] p-12 border border-dashed border-gray-200 text-center">
                     <p className="text-gray-400 font-medium italic">No upcoming scheduled calls.</p>
                  </div>
                )}
              </section>

              {/* History Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <History size={20} />
                   </div>
                   <h2 className="text-xl font-black text-gray-800">Call History</h2>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                   {pastCalls.length > 0 ? (
                     <div className="divide-y divide-gray-50">
                        {pastCalls.map((call) => (
                          <div key={call._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                             <div className="flex items-center gap-4">
                                <UserAvatar user={(call.caller?._id || call.caller) === (user.id || user._id) ? call.receiver : call.caller} />
                                <div>
                                   <p className="font-bold text-gray-900">{(call.caller?._id || call.caller) === (user.id || user._id) ? call.receiver?.name : call.caller?.name}</p>
                                   <p className="text-xs text-gray-400 font-medium">
                                      {new Date(call.scheduledAt || call.createdAt).toLocaleDateString()} • {call.type}
                                   </p>
                                </div>
                             </div>
                             <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(call.status)}`}>
                                {call.status}
                             </div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="p-12 text-center text-gray-400 italic">History is empty.</div>
                   )}
                </div>
              </section>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
               
               {/* Pending Invitations */}
               <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                        <AlertCircle size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-800">Invitations</h2>
                  </div>

                  {pendingInvitations.length > 0 ? (
                    <div className="space-y-4">
                       {pendingInvitations.map((call) => (
                         <div key={call._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                               <UserAvatar user={call.caller} />
                               <div>
                                  <p className="text-sm font-black text-gray-900">{call.caller?.name}</p>
                                  <p className="text-xs text-gray-400 font-medium">Invited you for a call</p>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <button 
                                onClick={() => handleRespond(call._id, "accepted")}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                               >
                                  Accept
                               </button>
                               <button 
                                onClick={() => handleRespond(call._id, "rejected")}
                                className="flex-1 bg-gray-50 text-gray-500 py-2 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all"
                               >
                                  Decline
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-dashed border-gray-200 text-center">
                       <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No pending invites</p>
                    </div>
                  )}
               </section>

               {/* Quick Tips */}
               <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                    <Video size={24} />
                  </div>
                  <h3 className="text-xl font-black mb-2">Video Safety</h3>
                  <p className="text-blue-100 text-sm font-medium mb-6">Always verify your environment and internet connection before starting a 1-on-1 session.</p>
                  <ul className="text-xs font-bold space-y-2 opacity-80 uppercase tracking-widest">
                    <li className="flex items-center gap-2"><Check size={14} /> Only matched users</li>
                    <li className="flex items-center gap-2"><Check size={14} /> End calls anytime</li>
                    <li className="flex items-center gap-2"><Check size={14} /> Report misconduct</li>
                  </ul>
               </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};

const UserAvatar = ({ user, size = "10" }) => (
    <div className={`w-${size} h-${size} relative flex-shrink-0`}>
        {user?.profilePic ? (
            <img src={user.profilePic} className="w-full h-full rounded-2xl object-cover shadow-sm border border-white" alt="" />
        ) : (
            <div className="w-full h-full bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">
                {user?.name?.charAt(0) || "U"}
            </div>
        )}
    </div>
);

const CallCard = ({ call, currentUser, onRespond, isUpcoming }) => {
    const isCaller = (call.caller?._id || call.caller) === (currentUser.id || currentUser._id);
    const otherPerson = isCaller ? call.receiver : call.caller;
    const date = new Date(call.scheduledAt);
    const navigate = useNavigate();

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-xl hover:shadow-blue-900/5"
        >
            <div className="flex items-center gap-6">
                <div className="relative">
                    <UserAvatar user={otherPerson} size="16" />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-6 h-6 rounded-full shadow-sm" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-none mb-2">{otherPerson?.name}</h3>
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500" /> {date.toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                {isUpcoming && (
                    <button 
                        onClick={() => navigate(`/call/${call.roomId}`)}
                        className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg"
                    >
                        <PhoneCall size={18} /> Join Now
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default CallsDashboard;
