// src/pages/Chat.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/Authcontext";
import io from "socket.io-client";
import API from "../utils/api";
import ChatBox from "../components/ChatBox";
import UserList from "../components/UserList";

const socket = io("http://localhost:5000");

export default function Chat() {
  const { user, logout } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (
        msg.sender === selectedUser?._id ||
        msg.receiver === selectedUser?._id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });
  }, [selectedUser]);

  const loadMessages = async (receiverId) => {
    const res = await API.get(`/messages/${user._id}/${receiverId}`);
    setMessages(res.data);
  };

  return (
    <div className="flex h-screen">
      <UserList
        user={user}
        onSelect={(u) => {
          setSelectedUser(u);
          loadMessages(u._id);
        }}
      />
      {selectedUser ? (
        <ChatBox
          user={user}
          selectedUser={selectedUser}
          messages={messages}
          setMessages={setMessages}
          socket={socket}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <h2 className="text-gray-500 text-xl">Select a user to start chat</h2>
        </div>
      )}
    </div>
  );
}
