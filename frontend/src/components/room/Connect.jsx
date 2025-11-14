import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { Users } from "lucide-react";

const ENDPOINT = "http://localhost:5000";
let socket;

const Connect = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomName, setRoomName] = useState("");

  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // socket connection
  useEffect(() => {
    socket = io(ENDPOINT, { auth: { token } });

    socket.on("newRoomMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => socket.disconnect();
  }, []);

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const res = await axios.get(`${ENDPOINT}/api/rooms`, config);
      setRooms(res.data);
    };
    fetchRooms();
  }, []);

  const joinRoom = async (room) => {
    setCurrentRoom(room);
    setMessages([]);

    const res = await axios.get(`${ENDPOINT}/api/rooms/${room._id}/messages`, config);
    setMessages(res.data);

    socket.emit("joinRoom", room._id);
  };

  const createRoom = async () => {
    if (!roomName.trim()) return;

    const res = await axios.post(
      `${ENDPOINT}/api/rooms/create`,
      { name: roomName },
      config
    );

    setRooms((prev) => [res.data, ...prev]);
    setRoomName("");
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentRoom) return;

    socket.emit("sendRoomMessage", {
      roomId: currentRoom._id,
      userId: user._id,
      text: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Create Room */}
      <div className="flex gap-2">
        <input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="flex-1 p-2 rounded border focus:ring-2 focus:ring-blue-400"
          placeholder="Enter room name"
        />
        <button
          onClick={createRoom}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
        >
          Create
        </button>
      </div>

      {/* Rooms Section Title */}
      <h2 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
        <Users size={26} className="text-blue-600" /> Chat Rooms
      </h2>

      {/* Rooms Grid (Dashboard Style Cards) */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <div
            key={room._id}
            onClick={() => joinRoom(room)}
            className={`cursor-pointer bg-white p-6 rounded-2xl shadow-lg 
              hover:shadow-2xl transition transform hover:-translate-y-1 
              border-l-4 ${
                currentRoom?._id === room._id
                  ? "border-blue-600 bg-blue-50"
                  : "border-blue-400"
              }`}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">
              {room.name}
            </h3>

            <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
              <Users size={16} className="mr-2 text-blue-500" />
              {room.members || 0} Members
            </div>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full text-sm hover:bg-blue-700 transition"
            >
              Join Room
            </button>
          </div>
        ))}
      </div>

      {/* Chat Section */}
      {currentRoom && (
        <div className="bg-white rounded-lg shadow p-4 flex flex-col h-[65vh] mt-6">
          <h3 className="font-bold text-xl mb-4 text-center border-b pb-2">
            {currentRoom.name}
          </h3>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-2 px-2">
            {messages.map((msg) => {
              const isMe = msg.sender._id === user._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {!isMe && <strong>{msg.sender.name}: </strong>}
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 p-2 rounded border focus:ring-2 focus:ring-blue-400"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connect;
