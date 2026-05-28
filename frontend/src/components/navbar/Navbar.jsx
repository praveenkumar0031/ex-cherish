import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, User, LogOut, Settings, Users, Search, Video, Bell, Menu, X as CloseIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  
  const dropdownRef = useRef();
  const notifRef = useRef();
  const mobileMenuRef = useRef();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
        const fetchNotifications = async () => {
            try {
              const res = await API.get("notifications");
              setNotifications(res.data || []);
            } catch (err) {
              console.error("Failed to fetch notifications", err);
            }
        };
        fetchNotifications();
    }
  }, [user]);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif) => {
        setNotifications(prev => [notif, ...prev]);
    };
    const handleIncomingCall = (data) => setIncomingCall(data);
    const handleCallEnded = (data) => {
        if(incomingCall && incomingCall.roomId === data?.roomId) setIncomingCall(null);
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
    setDropdownOpen(false);
    setMobileMenuOpen(false);
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

  const NavLink = ({ to, icon: Icon, label }) => {
      const isActive = location.pathname === to || (to !== "/dashboard" && location.pathname.includes(to));
      return (
        <button
            onClick={() => { navigate(to); setMobileMenuOpen(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold uppercase tracking-[0.1em] text-[10px] ${
            isActive 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
            }`}
        >
            <Icon size={14} strokeWidth={isActive ? 3 : 2} />
            {label}
        </button>
      );
  };

  return (
    <>
    <nav className="glass sticky top-0 z-[100] w-full border-b border-slate-200/50 backdrop-blur-xl h-[73px] flex items-center transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center w-full">

        {/* LOGO */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none group"
          onClick={() => navigate(user ? "/dashboard" : "/")}
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-2xl group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-blue-200">
            <Sparkles className="text-white" size={22} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-[900] bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent uppercase tracking-tighter">
            Excherish
          </h1>
        </div>

        {/* DESKTOP NAV */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard" icon={Users} label="Dashboard" />
            <NavLink to="/discover" icon={Search} label="Discover" />
            <NavLink to="/rooms" icon={Users} label="Groups" />
            <NavLink to="/calls" icon={Video} label="Calls" />
          </div>
        )}

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3 md:gap-5">
            {user ? (
                <>
                    {/* NOTIFICATIONS */}
                    <div className="relative" ref={notifRef}>
                        <button 
                            onClick={() => setNotifOpen(!notifOpen)}
                            className={`p-2.5 rounded-full transition-all duration-300 relative border ${
                                notifOpen ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            }`}
                        >
                            <Bell size={20} strokeWidth={2.2} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce shadow-md">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {notifOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-[340px] bg-white shadow-2xl rounded-[2.5rem] border border-slate-100 overflow-hidden z-[110]"
                                >
                                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Notifications</h3>
                                        {unreadCount > 0 && <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{unreadCount} New</span>}
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div 
                                                    key={n._id} 
                                                    onClick={() => handleMarkRead(n._id)}
                                                    className={`p-5 flex gap-4 hover:bg-blue-50/30 transition-all cursor-pointer border-b border-slate-50 last:border-0 ${!n.isRead ? "bg-blue-50/20" : ""}`}
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex-shrink-0 overflow-hidden shadow-sm">
                                                        {n.sender?.profilePic ? <img src={n.sender.profilePic} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-black text-lg">{n.sender?.name?.charAt(0)}</div>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-slate-700 leading-tight">
                                                            <span className="font-black text-slate-900">{n.sender?.name}</span> {n.message}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center flex flex-col items-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100/50">
                                                    <Bell className="text-slate-300" size={32} />
                                                </div>
                                                <p className="text-slate-400 font-bold text-sm">Quiet for now.</p>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => { setNotifOpen(false); navigate("/calls"); }}
                                        className="w-full p-5 bg-white border-t border-slate-50 text-[10px] font-black text-blue-600 hover:bg-blue-50 transition-all uppercase tracking-[0.2em]"
                                    >
                                        Activity Center
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* PROFILE DROPDOWN */}
                    <div className="relative hidden md:block" ref={dropdownRef}>
                        <div
                            className={`flex items-center gap-3 border px-1.5 py-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                                dropdownOpen ? "bg-white border-blue-200 shadow-lg shadow-blue-900/5" : "bg-slate-50/50 border-slate-200/60 hover:bg-white hover:border-slate-300"
                            }`}
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                {user.profilePic ? (
                                    <img src={user.profilePic} alt="profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-full h-full flex items-center justify-center text-white">
                                        <User size={18} strokeWidth={2.5} />
                                    </div>
                                )}
                            </div>
                            <span className="text-slate-900 font-[800] text-[13px] mr-2">
                                {user.name?.split(' ')[0] || "Me"}
                            </span>
                        </div>

                        <AnimatePresence>
                        {dropdownOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-60 bg-white shadow-2xl rounded-[2.5rem] border border-slate-100 overflow-hidden z-[110] p-2"
                        >
                            <div className="px-5 py-5 border-b border-slate-50 mb-2 bg-slate-50/30 rounded-t-[2rem]">
                                <p className="text-sm font-[900] text-slate-900 tracking-tight">{user.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest mt-0.5">{user.email}</p>
                            </div>

                            <div className="space-y-1">
                                <button
                                    onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
                                    className="flex items-center gap-3 w-full px-5 py-3 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
                                >
                                    <User size={16} strokeWidth={2.5} /> Profile
                                </button>
                                <button
                                    onClick={() => { setDropdownOpen(false); navigate("/settings"); }}
                                    className="flex items-center gap-3 w-full px-5 py-3 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
                                >
                                    <Settings size={16} strokeWidth={2.5} /> Settings
                                </button>

                                <div className="h-px bg-slate-50 mx-4 my-2"></div>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-5 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                >
                                    <LogOut size={16} strokeWidth={2.5} /> Logout
                                </button>
                            </div>
                        </motion.div>
                        )}
                        </AnimatePresence>
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2.5 rounded-full bg-slate-900 text-white shadow-lg active:scale-90 transition-transform"
                    >
                        {mobileMenuOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
                    </button>
                </>
            ) : (
                <button
                    className="bg-slate-900 text-white px-8 py-3 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                    onClick={() => navigate("/login")}
                >
                    Access
                </button>
            )}
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
                ref={mobileMenuRef}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="fixed top-0 right-0 h-screen w-[280px] bg-white shadow-2xl z-[120] border-l border-slate-100 flex flex-col"
            >
                <div className="p-8 flex items-center justify-between border-b border-slate-50">
                    <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs">Menu</h2>
                    <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-900"><CloseIcon size={24}/></button>
                </div>
                
                <div className="flex-1 p-6 space-y-3 mt-4">
                    <NavLink to="/dashboard" icon={Users} label="Dashboard" />
                    <NavLink to="/discover" icon={Search} label="Discover" />
                    <NavLink to="/rooms" icon={Users} label="Groups" />
                    <NavLink to="/calls" icon={Video} label="Calls" />
                    <div className="h-px bg-slate-50 my-6"></div>
                    <NavLink to="/profile" icon={User} label="My Profile" />
                    <NavLink to="/settings" icon={Settings} label="Settings" />
                </div>

                <div className="p-8 border-t border-slate-50">
                    <button 
                        onClick={handleLogout}
                        className="w-full py-4 bg-red-50 text-red-600 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-100 transition-all flex items-center justify-center gap-3"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </motion.div>
          )}
      </AnimatePresence>
    </nav>

    {/* Global Incoming Call Overlay */}
    <AnimatePresence>
      {incomingCall && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 100 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6"
        >
          <div className="bg-white rounded-[3.5rem] p-12 max-w-md w-full text-center shadow-[0_35px_80px_-15px_rgba(0,0,0,0.4)] border border-slate-100">
              <div className="relative inline-block mb-10">
                  <div className="w-28 h-28 bg-blue-50 text-blue-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner overflow-hidden border-4 border-white ring-8 ring-blue-50/50">
                      {incomingCall.profilePic ? (
                          <img src={incomingCall.profilePic} className="w-full h-full object-cover scale-110" alt="" />
                      ) : (
                          <Video size={56} strokeWidth={2.5} />
                      )}
                  </div>
                  <div className="absolute -top-1 -right-1 w-10 h-10 bg-green-500 rounded-full border-4 border-white animate-pulse shadow-xl flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full opacity-30 animate-ping" />
                  </div>
              </div>
              
              <h4 className="text-3xl font-[900] text-slate-900 mb-2 tracking-tighter uppercase">{incomingCall.name || "Someone"}</h4>
              <p className="text-blue-600 font-[800] tracking-[0.2em] text-[10px] uppercase mb-12">Incoming Knowledge Session</p>
              
              <div className="grid grid-cols-2 gap-4">
                  <button 
                      onClick={() => {
                          navigate(`/call/${incomingCall.roomId}`);
                          setIncomingCall(null);
                      }} 
                      className="bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-95"
                  >
                      Accept
                  </button>
                  <button 
                      onClick={() => {
                          if (socket) socket.emit("reject-call", { to: incomingCall.from, roomId: incomingCall.roomId });
                          setIncomingCall(null);
                      }} 
                      className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95"
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
