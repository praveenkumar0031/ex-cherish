import React, { useEffect, useState, useRef } from "react";
import ChatList from "./ChatList";
import MessageInput from "./MessageInput";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // ✅ Connect to backend Socket.IO

function Chat({ user }) {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

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
      if (
        message.sender === selectedChat ||
        message.receiver === selectedChat
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [selectedChat]);

  // Scroll to bottom automatically
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Send message (API + Socket)
  const sendMessage = async (msg) => {
    if (!msg.trim() || !selectedChat) return;

    const newMsg = {
      sender: user.username,
      receiver: selectedChat,
      text: msg,
    };

    await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMsg),
    });

    socket.emit("sendMessage", newMsg);
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-md rounded-r-lg p-4 flex-shrink-0">
        <ChatList
          setSelectedChat={setSelectedChat}
          selectedChat={selectedChat}
        />
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-blue-600 text-white px-6 py-4 rounded-b-lg shadow-md">
          {selectedChat ? (
            <h2 className="text-lg font-semibold">
              Chat with <span className="font-bold">{selectedChat}</span>
            </h2>
          ) : (
            <h2 className="text-lg font-semibold">Welcome, {user.username}</h2>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
          {selectedChat ? (
            messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.sender === user.username ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-xl shadow ${
                      msg.sender === user.username
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <strong>{msg.sender}: </strong> {msg.text}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 mt-4">No messages yet</p>
            )
          ) : (
            <p className="text-center text-gray-400 mt-4">Select a chat to start messaging</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {selectedChat && (
          <div className="bg-white p-4 shadow-inner flex gap-2">
            <MessageInput onSend={sendMessage} />
          </div>
        )}
      </main>
    </div>
  );
}

export default Chat;
