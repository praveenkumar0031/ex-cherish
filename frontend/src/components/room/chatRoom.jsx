import React, { useState, useEffect } from 'react';
import { socket } from '../../utils/socket';

const ChatRoom = ({ roomId, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.emit('join_room', roomId);

    socket.on('receive_room_msg', (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => socket.off('receive_room_msg');
  }, [roomId]);

  const sendMessage = () => {
    if (input) {
      socket.emit('send_room_msg', { room: roomId, sender: user._id, content: input });
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m, i) => (
          <p key={i}><strong>{m.sender === user._id ? "Me" : "Peer"}:</strong> {m.content}</p>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};