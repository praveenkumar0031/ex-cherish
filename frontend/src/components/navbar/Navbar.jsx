import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, User, LogOut, Settings, Users, Search, Video, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const dropdownRef = useRef();
  const notifRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif) => {
        setNotifications(prev => [notif, ...prev]);
    };

    const handleIncomingCall = (data) => {
        setIncomingCall(data);
    };

    const handleCallEnded = (data) => {
        if(incomingCall && incomingCall.roomId === data?.roomId) {
            setIncomingCall(null);
        }
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-ended", handleCallEnded);

    return () => {
        socket.off("new_notification");
        socket.off("incoming-call");
        socket.off("call-ended");
    };
  }, [socket, incomingCall]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMarkRead = async (id) => {
      try {
          await API.put(`notifications/${id}/read`);
          setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      } catch (err) {
          console.error("Failed to mark read", err);
      }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none group"
          onClick={() => navigate("/")}
        >
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-blue-100">
            <Sparkles className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent uppercase tracking-tighter">
            Excherish
          </h1>
        </div>

        {/* NAV LINKS */}
        {user && (
          <div className="hidden md:flex items-center space-x-1 font-bold text-gray-400 uppercase tracking-widest text-[10px]">
            <button
              onClick={() => navigate("/dashboard")}
              className={`px-4 py-2 rounded-xl transition-all ${
                location.pathname === "/dashboard" ? "text-blue-600 bg-blue-50" : "hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/discover")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                location.pathname === "/discover" ? "text-blue-600 bg-blue-50" : "hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Search size={14} /> Discover
            </button>

            <button
              onClick={() => navigate("/rooms")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                location.pathname.includes("/rooms") || location.pathname.includes("/interest-chat")
                  ? "text-blue-600 bg-blue-50"
                  : "hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Users size={14} /> Groups
            </button>

            <button
              onClick={() => navigate("/calls")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                location.pathname === "/calls" ? "text-blue-600 bg-blue-50" : "hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Video size={14} /> Calls
            </button>
          </div>
        )}

        {/* USER / NOTIF SECTION */}
        {user ? (
          <div className="flex items-center gap-4">
            
            {/* NOTIFICATIONS */}
            <div className="relative" ref={notifRef}>
                <button 
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="p-2.5 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 hover:text-blue-600 transition-all relative"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>

                <AnimatePresence>
                    {notifOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-80 bg-white shadow-2xl rounded-3xl border border-gray-100 overflow-hidden z-[60]"
                        >
                            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Notifications</h3>
                                {unreadCount > 0 && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div 
                                            key={n._id} 
                                            onClick={() => handleMarkRead(n._id)}
                                            className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${!n.isRead ? "bg-blue-50/30" : ""}`}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                                {n.sender?.profilePic ? <img src={n.sender.profilePic} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">{n.sender?.name?.charAt(0)}</div>}
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-800"><span className="font-bold">{n.sender?.name}</span> {n.message}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center text-gray-400 italic text-sm">No notifications yet.</div>
                                )}
                            </div>
                            <button 
                                onClick={() => {
                                    setNotifOpen(false);
                                    navigate("/calls");
                                }}
                                className="w-full p-4 bg-gray-50 text-[10px] font-black text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                            >
                                View All Activity
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
                <div
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full shadow-sm cursor-pointer hover:bg-gray-100 transition-all group"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                {user.profilePic ? (
                    <img
                    src={user.profilePic}
                    alt="profile"
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                ) : (
                    <div className="bg-blue-600 p-1.5 rounded-full text-white shadow-md">
                    <User size={18} />
                    </div>
                )}

                <span className="text-gray-700 font-bold text-sm hidden sm:block">
                    {user.name?.split(' ')[0] || "User"}
                </span>
                </div>

                <AnimatePresence>
                {dropdownOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-56 bg-white shadow-2xl rounded-3xl border border-gray-100 overflow-hidden z-50 p-2"
                >
                    <div className="px-4 py-4 border-b border-gray-50 mb-2">
                    <p className="text-sm font-black text-gray-900 tracking-tight">{user.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">{user.email}</p>
                    </div>

                    <div className="space-y-1">
                        <button
                        onClick={() => {
                            setDropdownOpen(false);
                            navigate("/profile");
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
                        >
                        <User size={16} /> Profile
                        </button>

                        <button
                        onClick={() => {
                            setDropdownOpen(false);
                            navigate("/settings");
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
                        >
                        <Settings size={16} /> Settings
                        </button>

                        <div className="h-px bg-gray-50 mx-2 my-2"></div>

                        <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        >
                        <LogOut size={16} /> Logout
                        </button>
                    </div>
                </motion.div>
                )}
                </AnimatePresence>
            </div>
          </div>
        ) : (
          <button
            className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition shadow-xl shadow-blue-100 active:scale-95"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>

    {/* Global Incoming Call Overlay */}
    <AnimatePresence>
      {incomingCall && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 100 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
        >
          <div className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center shadow-2xl border border-gray-100">
              <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner overflow-hidden border-2 border-white">
                      {incomingCall.profilePic ? (
                          <img src={incomingCall.profilePic} className="w-full h-full object-cover" alt="" />
                      ) : (
                          <Video size={48} />
                      )}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white animate-pulse shadow-lg" />
              </div>
              
              <h4 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter uppercase">{incomingCall.name || "Someone"}</h4>
              <p className="text-gray-500 font-bold tracking-widest text-xs uppercase mb-10 italic">Incoming Private Call</p>
              
              <div className="grid grid-cols-2 gap-4">
                  <button 
                      onClick={() => {
                          navigate(`/call/${incomingCall.roomId}`);
                          setIncomingCall(null);
                      }} 
                      className="bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-blue-200 active:scale-95"
                  >
                      Accept
                  </button>
                  <button 
                      onClick={() => {
                          if (socket) socket.emit("reject-call", { to: incomingCall.from, roomId: incomingCall.roomId });
                          setIncomingCall(null);
                      }} 
                      className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 py-5 rounded-3xl font-black uppercase tracking-widest text-sm transition-all active:scale-95"
                  >
                      Decline
                  </button>
              </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default Navbar;
