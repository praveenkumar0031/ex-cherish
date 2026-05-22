import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Title from "./components/title/Title";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/landing/DashBoard";
import Profile from "./components/profile/Profile";
import EditProfile from "./components/profile/EditProfile";
import Navbar from "./components/navbar/Navbar";

import Home from "./pages/Home.jsx";
import SettingsTab from "./components/landing/SettingsTab.jsx";

// Import new components
import DiscoveryPage from "./components/match/DiscoveryPage.jsx";
import RoomsPage from "./components/match/RoomsPage.jsx"; 
import InterestChat from "./components/chat/InterestedChat.jsx"; 
import PrivateChat from "./components/chat/PrivateChat.jsx"; 
import CallsDashboard from "./pages/CallsDashboard.jsx"; 

import "./App.css";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 bg-gray-50 font-medium">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Synchronizing session...
        </div>
      </div>
    );
  }

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
        <Navbar />

        <div className="pt-16">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Title title="Welcome to Excherish"><Home /></Title>} />
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" /> : <Title title="Login"><Login /></Title>}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/dashboard" /> : <Title title="Register"><Register /></Title>}
            />

            {/* PROTECTED ROUTES */}
            <Route path="/dashboard" element={<ProtectedRoute title="Dashboard"><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute title="Profile"><Profile /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute title="Edit Profile"><EditProfile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute title="Settings"><SettingsTab /></ProtectedRoute>} />
            
            <Route 
              path="/rooms" 
              element={<ProtectedRoute title="Interest Groups"><RoomsPage /></ProtectedRoute>} 
            />

            <Route 
              path="/interest-chat/:roomId" 
              element={<ProtectedRoute title="Interest Group Chat"><InterestChat /></ProtectedRoute>} 
            />

            <Route 
              path="/discover" 
              element={<ProtectedRoute title="Discover Matches"><DiscoveryPage /></ProtectedRoute>} 
            />

            <Route 
              path="/private-chat/:receiverId" 
              element={<ProtectedRoute title="Private Chat"><PrivateChat /></ProtectedRoute>} 
            />

            <Route 
              path="/calls" 
              element={<ProtectedRoute title="Calls Dashboard"><CallsDashboard /></ProtectedRoute>} 
            />

            {/* DEFAULT REDIRECT */}
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
