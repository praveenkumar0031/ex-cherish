// frontend/src/components/match/RoomsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InterestChat from '../chat/InterestedChat';
import { PlusCircle, Hash } from 'lucide-react'; // Added icons for better UI

const RoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [newRoomName, setNewRoomName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Fetch rooms from backend
    const fetchRooms = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/rooms", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(res.data);
        } catch (err) {
            console.error("Error fetching rooms:", err.response?.status);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    // Handle Room Creation
    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://localhost:5000/api/rooms/create", 
                { name: newRoomName }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Add new room to list and clear input
            setRooms((prev) => [...prev, res.data.room]);
            setNewRoomName("");
            setIsCreating(false);
            // Optionally set the new room as active
            setActiveRoom(res.data.room);
        } catch (err) {
            console.error("Error creating room:", err.response?.data?.message || err.message);
            alert("Failed to create room: " + (err.response?.data?.message || "Internal Error"));
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar: Room List */}
            <div className="w-1/4 bg-white border-r flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Interest Groups</h2>
                    <button 
                        onClick={() => setIsCreating(!isCreating)}
                        className="text-indigo-600 hover:text-indigo-800 transition"
                        title="Create New Room"
                    >
                        <PlusCircle size={24} />
                    </button>
                </div>

                {/* Create Room Form (Conditional) */}
                {isCreating && (
                    <form onSubmit={handleCreateRoom} className="p-4 bg-indigo-50 border-b">
                        <input 
                            type="text"
                            placeholder="Room name (e.g. JavaScript)"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            className="w-full p-2 border rounded md text-sm mb-2 outline-none focus:ring-2 focus:ring-indigo-400"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button 
                                type="submit"
                                className="flex-1 bg-indigo-600 text-white text-xs py-2 rounded hover:bg-indigo-700 transition"
                            >
                                Create
                            </button>
                            <button 
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="flex-1 bg-gray-300 text-gray-700 text-xs py-2 rounded hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {rooms.length > 0 ? (
                        rooms.map((room) => (
                            <button
                                key={room._id}
                                onClick={() => setActiveRoom(room)}
                                className={`w-full text-left p-3 rounded-lg flex items-center gap-2 transition ${
                                    activeRoom?._id === room._id 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                                }`}
                            >
                                <Hash size={18} className={activeRoom?._id === room._id ? 'text-indigo-200' : 'text-gray-400'} />
                                <span className="font-medium">{room.name}</span>
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 mt-10 text-sm px-4">No rooms available. Create one to get started!</p>
                    )}
                </div>
            </div>

            {/* Main Content: Chat Area */}
            <div className="flex-1 p-6 flex flex-col">
                {activeRoom ? (
                    <InterestChat roomId={activeRoom._id} roomName={activeRoom.name} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border">
                            <Hash size={48} className="mx-auto mb-4 text-indigo-100" />
                            <h3 className="text-lg font-semibold text-gray-700">Welcome to Skill Rooms</h3>
                            <p className="max-w-xs mt-2">
                                Select a room from the sidebar or create a new interest group to start chatting.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomsPage;