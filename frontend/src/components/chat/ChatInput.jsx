import React from "react";
import { SendHorizontal } from "lucide-react";

const ChatInput = ({ value, onChange, onSend, placeholder }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSend();
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="p-4 bg-white border-t border-gray-100 flex items-center gap-3"
    >
      <div className="flex-1 relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Type a message..."}
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-full py-3 px-6 pr-12 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
        />
      </div>
      <button
        type="submit"
        disabled={!value.trim()}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all shadow-md active:scale-95 flex items-center justify-center"
      >
        <SendHorizontal className="w-5 h-5" />
      </button>
    </form>
  );
};

export default ChatInput;
