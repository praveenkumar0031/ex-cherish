import React from "react";

const ChatLayout = ({ sidebar, children }) => {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      {/* Sidebar - Conversation List */}
      <aside className="w-80 flex-shrink-0 border-r border-gray-200 bg-white hidden md:flex flex-col">
        {sidebar}
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {children}
      </main>
    </div>
  );
};

export default ChatLayout;
