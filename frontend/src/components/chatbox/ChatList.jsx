import React, { useState } from "react";
import "./ChatList.css";

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
    <div className="chatlist">
      <h3>Chats</h3>

      <div className="add-chat">
        <input
          className="addbox"
          type="text"
          placeholder="username to excherif with..."
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddChat()}
        />
        <button onClick={handleAddChat}>Start</button>
      </div>

      <ul>
        {chats.map((chat, idx) => (
          <li
            key={idx}
            className={selectedChat === chat ? "active" : ""}
            onClick={() => setSelectedChat(chat)}
          >
            {chat}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
