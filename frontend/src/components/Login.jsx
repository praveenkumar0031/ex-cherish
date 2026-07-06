import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { toast } from "react-hot-toast";
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// BUG FIX: profilePic URL was hardcoded to http://localhost:5000 — breaks in production
const buildProfilePicUrl = (picPath) => {
  if (!picPath) return null;
  if (picPath.startsWith("http")) return picPath;
  return `${BACKEND_URL}${picPath}`;
};

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("auth/login", { email, password });
      const { token, user } = res.data;

      const cleanUser = {
        ...user,
        profilePic: buildProfilePicUrl(user.profilePic),
        token,
      };

      login(cleanUser);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-full max-w-[480px] bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 border border-white/10"
      >
        <div className="p-12 md:p-16">

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-12">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6 }}
              className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-slate-900/20"
            >
              <Sparkles className="text-white" size={40} />
            </motion.div>
            <h2 className="text-4xl font-[900] text-slate-900 tracking-tighter mb-3 uppercase italic">System Access</h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Initialize Secure Gateway Uplink</p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4"
              >
                <Zap className="text-red-500 shrink-0" size={18} />
                <p className="text-red-600 text-xs font-black uppercase tracking-widest leading-tight">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Email</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.8rem] pl-14 pr-6 py-5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.8rem] pl-14 pr-6 py-5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300 shadow-inner"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-[11px] active:scale-[0.98] disabled:bg-slate-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center space-y-6">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              No account?{" "}
              <span
                className="text-blue-600 cursor-pointer hover:text-blue-700 transition-colors border-b-2 border-blue-50 pb-0.5 ml-2"
                onClick={() => navigate("/register")}
              >
                Create One
              </span>
            </p>

            <div className="flex items-center justify-center gap-2 text-slate-300">
              <ShieldCheck size={14} />
              <span className="text-[8px] font-black uppercase tracking-[0.3em]">End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative watermark */}
      <div className="fixed bottom-10 left-10 text-white/10 select-none pointer-events-none">
        <p className="text-[120px] font-[900] tracking-tighter leading-none">EXCHERISH</p>
        <p className="text-[20px] font-black tracking-[0.5em] ml-2">KNOWLEDGE SHARING PLATFORM</p>
      </div>
    </div>
  );
}

export default Login;
