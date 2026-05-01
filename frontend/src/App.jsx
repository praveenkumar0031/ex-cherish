import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Title from "./components/title/Title";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/landing/DashBoard";
import Profile from "./components/profile/Profile";
import EditProfile from "./components/profile/EditProfile";
import Navbar from "./components/navbar/Navbar";
import Connect from "./components/room/Connect";
import Home from "./pages/Home.jsx";
import SettingsTab from "./components/landing/SettingsTab.jsx";

// Import new components
import ChatRoom from "./components/room/ChatRoom.jsx"; 
import DiscoveryPage from "./components/match/DiscoveryPage.jsx";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  // Helper for Protected Routes to keep the JSX clean
  const ProtectedRoute = ({ children, title }) => {
    return user ? (
      <Title title={title}>{children}</Title>
    ) : (
      <Navigate to="/login" replace />
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} setUser={setUser} />

        <div className="pt-16">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" /> : <Title title="Login"><Login setUser={setUser} /></Title>}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/dashboard" /> : <Title title="Register"><Register /></Title>}
            />

            {/* PROTECTED ROUTES */}
            <Route path="/dashboard" element={<ProtectedRoute title="Dashboard"><Dashboard user={user} /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute title="Home"><Home user={user} /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute title="Profile"><Profile user={user} /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute title="Edit Profile"><EditProfile user={user} setUser={setUser} /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute title="Settings"><SettingsTab user={user} /></ProtectedRoute>} />
            
            {/* SKILL EXCHANGE ROOMS */}
            <Route path="/room" element={<ProtectedRoute title="Skill Rooms"><Connect user={user} /></ProtectedRoute>} />

            {/* NEW: DISCOVERY / MATCHMAKING */}
            <Route 
              path="/discover" 
              element={<ProtectedRoute title="Discover Matches"><DiscoveryPage user={user} /></ProtectedRoute>} 
            />

            {/* NEW: DYNAMIC CHAT ROOM */}
            {/* We use :roomId so the component can grab the ID from the URL */}
            <Route 
              path="/chat/:roomId" 
              element={<ProtectedRoute title="Chat"><ChatRoom user={user} /></ProtectedRoute>} 
            />

            {/* DEFAULT ROUTE */}
            <Route path="*" element={<Navigate to={user ? "/home" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;