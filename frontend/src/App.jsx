import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/chatbox/Chat";
import Dashboard from "./components/landing/DashBoard";
import Profile from "./components/profile/Profile";
import EditProfile from "./components/profile/EditProfile";
import Navbar from "./components/navbar/Navbar";
import Connect from "./components/room/Connect";
import "./App.css";
import Home from "./pages/Home.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 new loading state

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // ✅ done checking
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

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} setUser={setUser} />
        <div className="pt-16">
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/dashboard" /> : <Register />}
            />
            <Route
              path="/dashboard"
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/room"
              element={user ? <Connect user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/chat"
              element={user ? <Chat user={user} /> : <Navigate to="/login" replace />}
            />
            
            <Route
              path="/home"
              element={user ? <Home user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/profile"
              element={user ? <Profile user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/edit-profile"
              element={user ? <EditProfile user={user} setUser={setUser} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="*"
              element={<Navigate to= "/home"  />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
