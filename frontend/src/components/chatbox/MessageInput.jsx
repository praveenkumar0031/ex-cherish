import React, { useState } from "react";
import "./MessageInput.css";

function MessageInput({ onSend }) {
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message.trim()) return;
    await onSend(message); // ✅ trigger Chat’s sendMessage (which calls API)
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="message-input">
      <input
        type="text"
        className="message-input-box"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default MessageInput;
