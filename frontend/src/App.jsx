import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
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
import CallRoom from "./pages/CallRoom.jsx";

import "./App.css";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 bg-slate-50 font-medium">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600/60">Establishing Secure Sync...</span>
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
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
        <Navbar />

        {/* Added h-[calc(100vh-73px)] to child containers where needed, but main min-h-screen handles overall scroll */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Title title="Welcome to Excherish"><Home /></Title>} />
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" /> : <Title title="Login"><Login /></Title>}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/dashboard" /> : <Title title="Create Account"><Register /></Title>}
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

            <Route 
              path="/call/:roomId" 
              element={<ProtectedRoute title="Video Session"><CallRoom /></ProtectedRoute>} 
            />

            {/* DEFAULT REDIRECT */}
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
