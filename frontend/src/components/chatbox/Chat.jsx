import React, { useEffect, useState } from "react";
import ChatList from "./ChatList";
import MessageInput from "./MessageInput";
import { io } from "socket.io-client";
import "./Chat.css";

const socket = io("http://localhost:5000"); // ✅ Connect to backend Socket.IO

function Chat({ user }) {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // ✅ Join room when user logs in
  useEffect(() => {
    if (user?.username) {
      socket.emit("join", user.username);
    }
  }, [user]);

  // ✅ Fetch messages from API when selecting a chat
  useEffect(() => {
    if (!selectedChat) return;
    const fetchMessages = async () => {
      const res = await fetch(
        `/api/messages/get?sender=${user.username}&receiver=${selectedChat}`
      );
      const data = await res.json();
      setMessages(data);
    };
    fetchMessages();
  }, [selectedChat, user.username]);

  // ✅ Listen for new messages via Socket.IO
  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      // Only add if the message is from or to the current chat
      if (
        message.sender === selectedChat ||
        message.receiver === selectedChat
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [selectedChat]);

  // ✅ Send message (API + Socket)
  const sendMessage = async (msg) => {
    if (!msg.trim() || !selectedChat) return;

    const newMsg = {
      sender: user.username,
      receiver: selectedChat,
      text: msg,
    };

    // 1️⃣ Save message to DB
    await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMsg),
    });

    // 2️⃣ Emit through socket for real-time delivery
    socket.emit("sendMessage", newMsg);

    // 3️⃣ Update local UI instantly
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="chat-container">
      <aside className="chat-list-section">
        <ChatList
          setSelectedChat={setSelectedChat}
          selectedChat={selectedChat}
        />
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          {selectedChat ? (
            <>Chat with <strong>{ selectedChat}</strong></>
          ) : (
            <>Welcome, {user.username}</>
          )}
        </header>

        <div className="chat-messages">
          {selectedChat ? (
            messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message ${
                    msg.sender === user.username ? "sent" : "received"
                  }`}
                >
                  <strong>{msg.sender}: </strong> {msg.text}
                </div>
              ))
            ) : (
              <p className="no-messages">No messages yet</p>
            )
          ) : (
            <p className="no-chat">Select a chat to start messaging</p>
          )}
        </div>

        {selectedChat && <MessageInput onSend={sendMessage} />}
      </main>
    </div>
  );
}

export default Chat;
