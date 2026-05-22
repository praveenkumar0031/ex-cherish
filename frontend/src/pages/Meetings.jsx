import React, { useState } from "react";
import axios from "axios";
import { Video, Plus, Key, Copy, Check } from "lucide-react";

const Meetings = ({ user }) => {
  const [meetingTitle, setMeetingTitle] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = async () => {
    try {
      setError("");
      const res = await axios.post(
        "http://localhost:5000/api/meetings/create",
        { title: meetingTitle || "Untitled Session" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCreatedMeeting(res.data);
      setMessage("Meeting created successfully!");
    } catch (err) {
      setError("Failed to create meeting. Please try again.");
    }
  };

  const handleJoin = async () => {
    try {
      setError("");
      setMessage("");
      const res = await axios.get(
        `http://localhost:5000/api/meetings/join/${joinCode}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage(`Successfully joined: ${res.data.meeting.title}`);
      // In a real app, you'd redirect to the meeting room here:
      // navigate(`/meeting-room/${joinCode}`);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or inactive meeting code.");
    }
  };

  const copyToClipboard = () => {
    if (createdMeeting) {
      navigator.clipboard.writeText(createdMeeting.meetingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Meetings Hub</h1>
        <p className="text-lg text-gray-600">Start a new session or join an existing one instantly.</p>
      </div>

      {(error || message) && (
        <div className={`mb-8 p-4 rounded-lg text-center font-medium ${error ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}>
          {error || message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* CREATE CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all hover:shadow-2xl">
          <div className="p-8">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Plus className="text-blue-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Host a Meeting</h2>
            <p className="text-gray-500 mb-6">Create a unique session ID and share it with your participants.</p>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Session Title (Optional)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
              />
              <button
                onClick={handleCreate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200"
              >
                <Video className="w-5 h-5" /> Generate Meeting Link
              </button>
            </div>

            {createdMeeting && (
              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Your Meeting Code</p>
                <div className="flex items-center justify-between gap-4">
                  <code className="text-xl font-mono font-bold text-blue-700 tracking-widest">{createdMeeting.meetingId}</code>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                  >
                    {copied ? <Check className="text-green-500 w-5 h-5" /> : <Copy className="text-gray-400 w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* JOIN CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all hover:shadow-2xl">
          <div className="p-8">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
              <Key className="text-indigo-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Join with Code</h2>
            <p className="text-gray-500 mb-6">Enter a meeting ID to join an active session instantly.</p>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter 8-character code"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all pr-12 font-mono uppercase tracking-widest"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
              </div>
              <button
                onClick={handleJoin}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200"
              >
                Enter Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Meetings;
