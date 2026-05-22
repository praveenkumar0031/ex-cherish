import React from "react";
import { CheckCheck } from "lucide-react";

const MessageBubble = ({ message, isMe, timestamp, senderName, senderPic }) => {
  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

  return (
    <div className={`flex gap-3 px-4 py-1 hover:bg-gray-50/80 transition-colors group ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {senderPic ? (
          <img src={senderPic} alt={senderName} className="w-10 h-10 rounded-full object-cover shadow-sm" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
            {senderName?.charAt(0) || "U"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 mb-1">
          {!isMe && <span className="text-sm font-bold text-gray-900">{senderName}</span>}
          <span className="text-[10px] text-gray-400 font-medium">{formattedTime}</span>
        </div>
        
        <div className={`px-4 py-2 rounded-2xl shadow-sm ${
          isMe 
            ? "bg-blue-600 text-white rounded-tr-none" 
            : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
        }`}>
          <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">{message}</p>
        </div>

        {isMe && (
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <CheckCheck className="w-3 h-3 text-blue-500" />
            <span className="text-[9px] text-gray-400 uppercase tracking-tighter">Delivered</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
