import React, { useState } from "react";

const ChatList = ({ setSelectedChat, selectedChat }) => {
  const [chats, setChats] = useState([]);
  const [newUser, setNewUser] = useState("");

  const handleAddChat = () => {
    const trimmedUser = newUser.trim();
    if (trimmedUser && !chats.includes(trimmedUser)) {
      setChats([...chats, trimmedUser]);
    }
    setSelectedChat(trimmedUser); // open that chat immediately
    setNewUser("");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-72 flex flex-col space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 text-center">Chats</h3>

      {/* Add new chat */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Username to Excherish with..."
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddChat()}
          className="flex-1 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <button
          onClick={handleAddChat}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Start
        </button>
      </div>

      {/* Chat list */}
      <ul className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
        {chats.map((chat, idx) => (
          <li
            key={idx}
            onClick={() => setSelectedChat(chat)}
            className={`cursor-pointer px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition flex items-center justify-between
              ${selectedChat === chat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
          >
            {chat}
            {selectedChat === chat && <span className="ml-2 text-sm font-semibold">•</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
