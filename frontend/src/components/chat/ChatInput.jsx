import React from "react";
import { SendHorizontal, Zap } from "lucide-react";
import { motion } from "framer-motion";

const ChatInput = ({ value, onChange, onSend, placeholder }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSend();
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center gap-4 group"
    >
      <div className="flex-1 relative">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
            <Zap size={18} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Transmit data..."}
          className="w-full bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold rounded-[1.8rem] py-5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-300 shadow-inner"
        />
      </div>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileActive={{ scale: 0.95 }}
        type="submit"
        disabled={!value.trim()}
        className="bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 disabled:shadow-none text-white p-5 rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center group/btn"
      >
        <SendHorizontal className="w-6 h-6 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" strokeWidth={2.5} />
      </motion.button>
    </form>
  );
};

export default ChatInput;
