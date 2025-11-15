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
  const [members, setMembers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomName, setRoomName] = useState("");

  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  /* SOCKET */
  useEffect(() => {
    socket = io(ENDPOINT, { auth: { token } });

    socket.on("newRoomMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => socket.disconnect();
  }, []);

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* FETCH ROOMS */
  useEffect(() => {
    const fetchRooms = async () => {
      const res = await axios.get(`${ENDPOINT}/api/rooms`, config);
      setRooms(res.data);
    };
    fetchRooms();
  }, []);

  /* MEMBERS FETCH */
  const fetchMembers = async (roomId) => {
    const res = await axios.get(`${ENDPOINT}/api/rooms/${roomId}/members`, config);
    setMembers(res.data);
  };

  /* JOIN ROOM */
  const joinRoom = async (room) => {
    setCurrentRoom(room);
    setMessages([]);

    await axios.post(`${ENDPOINT}/api/rooms/${room._id}/join`, {}, config);

    const res = await axios.get(`${ENDPOINT}/api/rooms/${room._id}/messages`, config);
    setMessages(res.data);

    fetchMembers(room._id);

    socket.emit("joinRoom", room._id);
  };

  /* CREATE ROOM */
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

  /* SEND MESSAGE */
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
    <div className="max-w-7xl mx-auto p-6 space-y-8">

      {/* CREATE ROOM */}
      <div className="flex gap-2">
        <input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="flex-1 p-3 rounded-xl border shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Enter a new room name..."
        />
        <button
          onClick={createRoom}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition"
        >
          Create
        </button>
      </div>

      {/* TITLE */}
      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <Users size={28} className="text-blue-500" /> Chat Rooms
      </h2>

      {/* ROOMS GRID */}
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
              {room.members?.length || 0} online
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full text-sm hover:bg-blue-700 transition">
              Join Room
            </button>
          </div>
        ))}
      </div>

      {/* CHAT */}
      {currentRoom && (
  <div className="bg-white rounded-xl shadow-xl p-4 flex flex-col h-[70vh] mt-6 border border-gray-200">

    {/* HEADER */}
    <div className="flex justify-between items-center border-b pb-3 px-2">
      <h3 className="font-bold text-xl text-gray-800">{currentRoom.name}</h3>

      {/* Members Count */}
      <div className="flex items-center gap-2 bg-blue-50 text-red-700 px-3 py-1 rounded-full shadow-sm">
        <Users size={16} />
        <span className="font-medium text-red-500">{members.length - 1}</span>
      </div>
    </div>

    {/* MESSAGES */}
    <div className="flex-1 overflow-y-auto py-4 space-y-4 px-3 bg-gray-50 rounded-xl mt-3">

      {messages.map((msg) => {
        const isMe = msg.sender._id === user._id;

        return (
          <div
            key={msg._id}
            className={`flex items-start gap-3 ${isMe ? "justify-end" : ""}`}
          >
            {/* AVATAR */}
            {!isMe && (
              <img
                src={
                  msg.sender.profilePic
                    ? `http://localhost:5000${msg.sender.profilePic}`
                    : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                className="w-10 h-10 rounded-full object-cover shadow"
              />
            )}

            {/* MESSAGE BUBBLE */}
            <div className={`max-w-xs ${isMe ? "text-right" : ""}`}>

              {/* USERNAME + TIME */}
              {!isMe && (
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {msg.sender.name} &nbsp;
                  <span className="text-gray-400 text-xs">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
              )}

              <div
                className={`px-4 py-2 rounded-2xl shadow-md text-[15px] leading-relaxed
                  ${isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border"
                  }`}
              >
                {msg.text}
              </div>
            </div>

            
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>

    {/* INPUT BOX */}
    <div className="flex gap-2 mt-3">
      <input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        className="flex-1 p-3 rounded-xl border shadow-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
        placeholder="Type a message..."
      />

      <button
        onClick={sendMessage}
        className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition"
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
