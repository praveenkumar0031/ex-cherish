import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, User, LogOut, Settings } from "lucide-react";

const Navbar = ({ user, setUser }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync user when login/logout happens
  useEffect(() => {
    const syncUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    };
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    navigate("/home");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
          <Sparkles className="text-blue-600" size={26} />
          <h1 className="text-xl font-bold text-gray-800">Ex-cherish</h1>
        </div>

        {/* NAV LINKS – visible only when user is logged in */}
        {user && (
          <div className="hidden md:flex space-x-8 font-medium text-gray-700">
            <button
              onClick={() => navigate("/home")}
              className={`hover:text-blue-600 transition ${
                location.pathname === "/home"
                  ? "text-blue-600 font-semibold"
                  : ""
              }`}
            >
              Home
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className={`hover:text-blue-600 transition ${
                location.pathname === "/explore"
                  ? "text-blue-600 font-semibold"
                  : ""
              }`}
            >
              Explore
            </button>

            <button
              onClick={() => navigate("/chat")}
              className={`hover:text-blue-600 transition ${
                location.pathname === "/chat"
                  ? "text-blue-600 font-semibold"
                  : ""
              }`}
            >
              Chat
            </button>

            <button
              onClick={() => navigate("/room")}
              className={`hover:text-blue-600 transition ${
                location.pathname === "/room"
                  ? "text-blue-600 font-semibold"
                  : ""
              }`}
            >
              Connect
            </button>
          </div>
        )}

        {/* USER / LOGIN SECTION */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full shadow-sm cursor-pointer hover:bg-gray-100 transition"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="profile"
                  className="w-9 h-9 rounded-full border border-gray-300 object-cover"
                />
              ) : (
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="text-blue-600" size={22} />
                </div>
              )}

              <span className="text-gray-800 font-medium">
                {user.name || "User"}
              </span>
            </div>

            {/* DROPDOWN MENU */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden z-50">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/profile");
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-blue-50"
                >
                  <User size={18} /> Profile
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/settings");
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-blue-50"
                >
                  <Settings size={18} /> Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-blue-50"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
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
