"use client";

import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const MessageUser = () => {
  const { userId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const organizerId = localStorage.getItem('userId');
  const handleSend = async () => {
    if (!message.trim()) return;
  
    try {
      const res = await fetch("http://localhost:5050/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: userId,
          fromUserId: organizerId,   // 🔥 pass it here
          content: message,
        }),
      });
  
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
  
      // Add immediately
      const newMessage = {
        content: message,
        from: organizerId,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    } catch (err) {
      console.error("❌ Error sending message:", err.message);
      alert("Failed to send message.");
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5050/api/messages/conversation/${userId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("❌ Error fetching messages:", err.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7faf9]">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((msg, idx) => (
  <div
    key={idx}
    className={`p-3 rounded-2xl max-w-xs ${
      msg.from === organizerId
        ? "bg-[#3A6953] text-white self-end ml-auto"
        : "bg-gray-200 text-black self-start"
    }`}
  >
    <p>{msg.content}</p>
    <span className="block mt-1 text-xs text-right opacity-70">
      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
  </div>
))}

        </div>
      </div>

      <div className="p-4 border-t bg-white flex items-center">
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2 mr-2 focus:outline-none"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-[#3A6953] hover:bg-[#285236] text-white px-6 py-2 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageUser;
