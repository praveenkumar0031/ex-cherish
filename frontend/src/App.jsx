import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Title from "./components/title/Title";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/chatbox/Chat";
import Dashboard from "./components/landing/DashBoard";
import Profile from "./components/profile/Profile";
import EditProfile from "./components/profile/EditProfile";
import Navbar from "./components/navbar/Navbar";
import Connect from "./components/room/Connect";
import Home from "./pages/Home.jsx";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Save user on change
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  // Loading UI
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

            {/* LOGIN */}
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Title title="Login">
                    <Login setUser={setUser} />
                  </Title>
                )
              }
            />

            {/* REGISTER */}
            <Route
              path="/register"
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Title title="Register">
                    <Register />
                  </Title>
                )
              }
            />

            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                user ? (
                  <Title title="Dashboard">
                    <Dashboard user={user} />
                  </Title>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* ROOM */}
            <Route
              path="/room"
              element={
                user ? (
                  <Title title="Rooms">
                    <Connect user={user} />
                  </Title>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* CHAT */}
            <Route
              path="/chat"
              element={
                user ? (
                  <Title title="Chat">
                    <Chat user={user} />
                  </Title>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* HOME */}
            <Route
              path="/home"
              element={
                user ? (
                  <Title title="Home">
                    <Home user={user} />
                  </Title>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* PROFILE */}
            <Route
              path="/profile"
              element={
                user ? (
                  <Title title="Profile">
                    <Profile user={user} />
                  </Title>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* EDIT PROFILE */}
            <Route
              path="/edit-profile"
              element={
                user ? (
                  <Title title="Edit Profile">
                    <EditProfile user={user} setUser={setUser} />
                  </Title>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* DEFAULT ROUTE */}
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
