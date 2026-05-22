const webrtcHandler = (io, socket) => {
  // Initiator rings the receiver
  socket.on("ring-user", ({ userToCall, callerName, callerPic, roomId, callType }) => {
    io.to(userToCall).emit("incoming-call", { 
        from: socket.user.id, 
        name: callerName,
        profilePic: callerPic,
        roomId, 
        callType 
    });
  });

  // Receiver navigates to room and joins, or anyone joins room
  socket.on("join-call-room", ({ roomId }) => {
    socket.join(roomId);
    // Notify others in room that a user joined
    socket.to(roomId).emit("user-joined", socket.user.id);
  });

  // WebRTC signaling
  socket.on("send-signal", ({ roomId, signal, to }) => {
    // If 'to' is provided, send specific. Otherwise broadcast to room.
    if (to) {
        io.to(to).emit("receive-signal", { signal, from: socket.user.id });
    } else {
        socket.to(roomId).emit("receive-signal", { signal, from: socket.user.id });
    }
  });

  socket.on("reject-call", ({ to, roomId }) => {
    io.to(to).emit("call-rejected", { roomId });
  });

  socket.on("end-call", ({ roomId, to }) => {
    socket.to(roomId).emit("call-ended");
    if(to) io.to(to).emit("call-ended");
  });
};

export default webrtcHandler;
