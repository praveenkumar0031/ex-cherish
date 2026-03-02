import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // Optional: for better notifications

const ExchangeManager = ({ user }) => {
  const [cards, setCards] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    skillOffered: "",
    skillDesired: "",
  });

  // 1. Load available cards for the Landing Page
  const fetchAvailableCards = async () => {
    try {
      const { data } = await axios.get("/api/rooms/discover");
      setCards(data);
    } catch (err) {
      console.error("Error fetching cards", err);
    }
  };

  useEffect(() => {
    fetchAvailableCards();
  }, []);

  // 2. Handle Creating a Unique Card
  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/rooms/create", formData);
      setFormData({ name: "", skillOffered: "", skillDesired: "" });
      fetchAvailableCards(); // Refresh the list
      toast.success("Skill Card Created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create card");
    }
  };

  // 3. Handle Connecting (Joining a 1-on-1)
  const handleConnect = async (roomId) => {
    try {
      await axios.post(`/api/rooms/${roomId}/connect`);
      toast.success("Connected! Go to your chats to start messaging.");
      // Redirect logic here if needed: navigate('/chats')
    } catch (err) {
      toast.error(err.response?.data?.message || "Connection failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      
      {/* SECTION: Create a Card */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create an Exchange Card</h2>
        <form onSubmit={handleCreateCard} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Unique Room Name (e.g. ReactMasters)"
            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Skill You Offer"
            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.skillOffered}
            onChange={(e) => setFormData({ ...formData, skillOffered: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Skill You Want"
            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.skillDesired}
            onChange={(e) => setFormData({ ...formData, skillDesired: e.target.value })}
            required
          />
          <button type="submit" className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">
            Post Card
          </button>
        </form>
      </section>

      {/* SECTION: Discover Cards (Landing Page Grid) */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Discover Skills</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.length > 0 ? (
            cards.map((card) => (
              <div key={card._id} className="bg-white border border-gray-200 p-6 rounded-2xl hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img src={card.createdBy?.profilePic || "https://via.placeholder.com/40"} alt="User" className="w-10 h-10 rounded-full" />
                    <p className="text-sm font-semibold text-gray-700">{card.createdBy?.name}</p>
                  </div>
                  <h3 className="text-xl font-bold text-blue-600 mb-2">{card.name}</h3>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-600"><span className="font-bold">Offers:</span> {card.skillOffered}</p>
                    <p className="text-sm text-gray-600"><span className="font-bold">Wants:</span> {card.skillDesired}</p>
                  </div>
                </div>
                
                {/* Prevent user from connecting to their own card */}
                {card.createdBy?._id !== user?.id ? (
                  <button 
                    onClick={() => handleConnect(card._id)}
                    className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Connect 1-on-1
                  </button>
                ) : (
                  <p className="text-center text-xs text-gray-400 italic">This is your card</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-10">No active skill cards found. Be the first to post!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ExchangeManager;