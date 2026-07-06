import React, { useEffect, useState } from "react";
import axios from "axios";

const ChatList = ({ setSelectedRoom, selectedRoom, userId }) => {
  const [rooms, setRooms] = useState([]);

  // Fetch rooms where the user is a member
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/api/rooms/my-exchanges");
        setRooms(res.data);
      } catch (err) {
        console.error("Error fetching exchanges", err);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="bg-white h-full flex flex-col space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Your Exchanges</h3>

      <ul className="flex flex-col gap-2 overflow-y-auto">
        {rooms.map((room) => {
          // Find the name of the OTHER person in the room
          const partner = room.members.find((m) => m._id !== userId);
          
          return (
            <li
              key={room._id}
              onClick={() => setSelectedRoom(room)}
              className={`cursor-pointer px-4 py-3 rounded-lg shadow-sm transition flex flex-col
                ${selectedRoom?._id === room._id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-blue-50"}`}
            >
              <span className="font-bold">{partner?.name || "User"}</span>
              <span className="text-xs opacity-80">Skill: {room.skillOffered}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChatList;