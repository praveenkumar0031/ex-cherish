import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Signal } from "lucide-react";
import { motion } from "framer-motion";

const CallRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  
  const [stream, setStream] = useState(null);
  const [callData, setCallData] = useState(null);
  const [peerConnected, setPeerConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callEnded, setCallEnded] = useState(false);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  const isInitiator = new URLSearchParams(location.search).get("initiator") === "true";
  const receiverId = new URLSearchParams(location.search).get("receiverId");

  useEffect(() => {
    let localStream;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        localStream = currentStream;
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
        
        API.get(`calls/room/${roomId}`).then(res => {
            setCallData(res.data);
            if (socket) socket.emit("join-call-room", { roomId });
        }).catch(err => {
            console.error("Failed to fetch call data", err);
            alert("Invalid Call Room");
            navigate("/calls");
        });
      })
      .catch(err => {
        console.error("Media Error", err);
        alert("Camera and Microphone access is required for video calls.");
        navigate("/calls");
      });

    return () => {
        if(localStream) localStream.getTracks().forEach(t => t.stop());
        if(connectionRef.current) connectionRef.current.destroy();
    };
  }, [roomId, navigate, socket]);

  useEffect(() => {
    if (!socket || !stream || !callData) return;

    if (isInitiator && receiverId && !callEnded) {
        // Ring the user once we're in the room and ready
        socket.emit("ring-user", {
            userToCall: receiverId,
            callerName: user.name,
            callerPic: user.profilePic,
            roomId,
            callType: callData.callType
        });
    }

    const handleUserJoined = (joinedUserId) => {
        if (isInitiator) {
            const peer = new Peer({ initiator: true, trickle: false, stream });
            peer.on("signal", data => {
                socket.emit("send-signal", { roomId, signal: data });
            });
            peer.on("stream", currentStream => {
                if (userVideo.current) userVideo.current.srcObject = currentStream;
            });
            peer.on("error", console.error);
            connectionRef.current = peer;
        }
    };

    const handleReceiveSignal = ({ signal, from }) => {
        if (!isInitiator) {
            if (!connectionRef.current) {
                const peer = new Peer({ initiator: false, trickle: false, stream });
                peer.on("signal", data => {
                    socket.emit("send-signal", { roomId, signal: data, to: from });
                });
                peer.on("stream", currentStream => {
                    if (userVideo.current) userVideo.current.srcObject = currentStream;
                });
                peer.on("error", console.error);
                peer.signal(signal);
                connectionRef.current = peer;
            } else {
                connectionRef.current.signal(signal);
            }
            setPeerConnected(true);
        } else {
            // Initiator receives the answer signal
            if (connectionRef.current && !connectionRef.current.destroyed) {
                connectionRef.current.signal(signal);
                setPeerConnected(true);
            }
        }
    };

    const handleCallRejected = () => {
        alert("Call was declined.");
        leaveCall();
    };

    const handleCallEnded = () => {
        if (!callEnded) {
            alert("The call has ended.");
            setCallEnded(true);
            leaveCall();
        }
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("receive-signal", handleReceiveSignal);
    socket.on("call-rejected", handleCallRejected);
    socket.on("call-ended", handleCallEnded);

    return () => {
        socket.off("user-joined", handleUserJoined);
        socket.off("receive-signal", handleReceiveSignal);
        socket.off("call-rejected", handleCallRejected);
        socket.off("call-ended", handleCallEnded);
    }
  }, [socket, stream, callData, isInitiator, receiverId, roomId, user.name, user.profilePic, callEnded]);

  const leaveCall = () => {
      setCallEnded(true);
      if (socket) socket.emit("end-call", { roomId });
      if (callData) {
          API.patch(`calls/${callData._id}/status`, { status: "completed" }).catch(console.error);
      }
      if(connectionRef.current) connectionRef.current.destroy();
      navigate("/calls");
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !isCameraOn;
      setIsCameraOn(!isCameraOn);
    }
  };

  // Determine who the other person is
  const otherPerson = callData ? 
    ((callData.caller._id || callData.caller) === (user.id || user._id) ? callData.receiver : callData.caller) 
    : null;

  return (
    <div className="fixed inset-0 z-[150] bg-[#0f172a] flex flex-col font-sans">
      <div className="flex-1 relative flex items-center justify-center overflow-hidden p-6">
        
        {/* Remote Video */}
        <div className="w-full h-full bg-gray-900 rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10">
          <video 
            playsInline 
            ref={userVideo} 
            autoPlay 
            className={`w-full h-full object-cover transition-opacity duration-500 ${peerConnected ? 'opacity-100' : 'opacity-0'}`} 
          />

          {!peerConnected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-8 shadow-inner"
                >
                    {otherPerson?.profilePic ? (
                        <img src={otherPerson.profilePic} className="w-full h-full rounded-full object-cover opacity-50" alt=""/>
                    ) : (
                        <Video size={48} className="text-blue-500" />
                    )}
                </motion.div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">
                    {isInitiator ? `Calling ${otherPerson?.name || 'User'}...` : "Connecting to Session..."}
                </h3>
                <p className="text-gray-400 font-medium tracking-wide">
                    {isInitiator ? "Waiting for them to join" : "Establishing secure peer-to-peer connection"}
                </p>
            </div>
          )}

          {/* Top Info Bar */}
          <div className="absolute top-6 left-8 right-8 flex justify-between items-center z-20">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
                  <div className={`w-2 h-2 rounded-full ${peerConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                  <span className="text-xs font-black text-white uppercase tracking-widest">
                      {peerConnected ? "Connected" : "Connecting"}
                  </span>
              </div>
              
              <div className="flex gap-2">
                  <button className="p-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 text-white hover:bg-white/10 transition-all">
                      <Signal size={18} className={peerConnected ? "text-green-400" : "text-gray-400"} />
                  </button>
                  <button className="p-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 text-white hover:bg-white/10 transition-all">
                      <Maximize2 size={18} />
                  </button>
              </div>
          </div>
        </div>

        {/* Local Video PIP */}
        <motion.div 
            drag
            dragConstraints={{ left: -500, right: 0, top: 0, bottom: 300 }}
            className="absolute top-12 right-12 w-48 md:w-64 aspect-video bg-gray-800 rounded-3xl overflow-hidden border-4 border-gray-900 shadow-2xl z-30 cursor-move"
        >
          <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
        </motion.div>

        {/* Controls Dock */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-10 py-5 bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <button 
            onClick={toggleMic}
            className={`p-5 rounded-2xl transition-all active:scale-90 ${isMicOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500 text-white shadow-xl shadow-red-500/40"}`}
          >
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          
          <button 
            onClick={toggleCamera}
            className={`p-5 rounded-2xl transition-all active:scale-90 ${isCameraOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500 text-white shadow-xl shadow-red-500/40"}`}
          >
            {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          <div className="w-px h-10 bg-white/10 mx-2" />

          <button 
            onClick={leaveCall}
            className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-2xl shadow-2xl shadow-red-600/40 transition-all active:scale-95 flex items-center gap-3 font-black uppercase tracking-widest"
          >
            <PhoneOff size={24} /> <span className="hidden md:inline">End Session</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CallRoom;
