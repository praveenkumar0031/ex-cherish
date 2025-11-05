import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, User } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Brand */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Sparkles className="text-blue-600" size={26} />
          <h1 className="text-xl font-bold text-gray-800">KnowledgeShare</h1>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-8 font-medium text-gray-700">
          <button onClick={() => navigate("/")} className="hover:text-blue-600 transition">Home</button>
          <button onClick={() => navigate("/explore")} className="hover:text-blue-600 transition">Explore</button>
          <button onClick={() => navigate("/chat")} className="hover:text-blue-600 transition">Chat</button>
          <button onClick={() => navigate("/learn")} className="hover:text-blue-600 transition">Learn</button>
          <button onClick={() => navigate("/connect")} className="hover:text-blue-600 transition">Connect</button>
        </div>

        {/* User Section */}
        {user ? (
          <div
            className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full shadow-sm cursor-pointer hover:bg-gray-100 transition"
            onClick={() => navigate("/profile")}
          >
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt="profile"
                className="w-9 h-9 rounded-full border border-gray-300"
              />
            ) : (
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="text-blue-600" size={22} />
              </div>
            )}
            <span className="text-gray-800 font-medium">
              {user.username || "User"}
            </span>
          </div>
        ) : (
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
