import React from "react";
import { Check, CheckCheck } from "lucide-react";

const MessageBubble = ({ message, isMe, timestamp }) => {
  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

  return (
    <div className={`flex flex-col mb-4 ${isMe ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[80%] md:max-w-[70%] px-4 py-2.5 shadow-sm transition-all ${
          isMe
            ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
            : "bg-gray-100 text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none"
        }`}
      >
        <p className="text-[15px] leading-relaxed break-words">{message}</p>
        
        <div className={`flex items-center gap-1.5 mt-1 justify-end opacity-70`}>
          <span className="text-[10px] font-medium tracking-tight">
            {formattedTime}
          </span>
          {isMe && <CheckCheck className="w-3 h-3" />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
