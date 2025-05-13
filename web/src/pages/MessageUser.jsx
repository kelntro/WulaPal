"use client";

import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const MessageUser = () => {
  const { userId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const sendMessage = async () => {
    if (!message.trim() && !file) return;

    const formData = new FormData();
    formData.append("toUserId", userId);
    formData.append("fromUserId", user._id);
    formData.append("content", message);
    if (file) formData.append("attachment", file);

    try {
      const res = await fetch("http://localhost:5050/api/messages/send", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const newMessage = {
        content: message,
        from: user._id,
        timestamp: new Date().toISOString(),
        attachment: file ? URL.createObjectURL(file) : null,
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      setFile(null);
    } catch (err) {
      console.error("❌ Error sending message:", err.message);
      alert("Failed to send message.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f4faf7]">
      {/* Message area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6 bg-[#F0F8F4] scroll-smooth">
        {messages.map((msg, idx) => {
          const isMe = msg.from === user._id;
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end`}>
              <div className={`relative max-w-[70%] ${isMe ? 'bg-gradient-to-br from-green-200 to-green-100' : 'bg-white'} p-4 rounded-2xl shadow-md flex flex-col`}>
                {msg.attachment && (
                  <a href={msg.attachment} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    📎 View Attachment
                  </a>
                )}
                <span className="text-gray-800 break-words whitespace-pre-wrap">{msg.content}</span>
                <div className={`text-xs mt-2 ${isMe ? 'text-right' : 'text-left'} text-gray-400 font-medium`}>
                  {new Date(msg.timestamp).toLocaleString(undefined, {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-green-200 flex gap-3 bg-white items-center rounded-b-3xl shadow-inner">
        <label className="text-gray-400 cursor-pointer flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 hover:text-green-700 transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7.828a4 4 0 010 5.656l-4.95 4.95a3 3 0 01-4.243-4.243l7.071-7.071a2 2 0 112.828 2.828l-7.071 7.071" />
          </svg>
          <input type="file" onChange={handleFileChange} className="hidden" />
          <span className="sr-only">Choose File</span>
        </label>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-green-600 bg-[#F0F8F4] shadow-inner"
          placeholder="Type a message..."
        />
        {file && <span className="ml-2 text-green-600 font-medium truncate max-w-[120px]">{file.name}</span>}
        <button
          onClick={sendMessage}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-[#3A6953] text-white font-semibold hover:bg-green-800 transition-all shadow-lg text-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21l16.5-9-16.5-9v7.5l13.5 1.5-13.5 1.5V21z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageUser;
