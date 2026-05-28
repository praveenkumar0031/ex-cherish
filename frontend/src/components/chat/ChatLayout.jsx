import React from "react";

const ChatLayout = ({ sidebar, children }) => {
  return (
    <div className="flex h-[calc(100vh-73px)] overflow-hidden bg-white">
      {/* Sidebar - Conversation List */}
      <aside className="w-full md:w-[380px] flex-shrink-0 border-r border-slate-100 bg-white hidden md:flex flex-col relative z-20 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.02)]">
        {sidebar}
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '30px 30px' }} />
        {children}
      </main>
    </div>
  );
};

export default ChatLayout;
