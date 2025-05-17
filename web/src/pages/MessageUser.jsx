import React, { useEffect, useState, useRef } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { useParams, useNavigate } from "react-router-dom";

const MessageUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5050/api/messages/conversation/${userId}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("❌ Error fetching messages:", err.message);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5050/api/users/${userId}`);
        const data = await res.json();
        setUserDetails(data);
      } catch (err) {
        console.error("❌ Error fetching user info:", err.message);
      }
    };

    if (userId) {
      fetchMessages();
      fetchUser();
    }
  }, [userId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const sendMessage = async () => {
    if (!message.trim() && !file) return;

    try {
      const res = await fetch("http://localhost:5050/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: userId,
          fromUserId: user._id,
          content: message,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const newMessage = {
        content: message,
        from: user._id,
        timestamp: new Date().toISOString(),
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
    <div className="fixed top-[40px] left-1/2 transform -translate-x-1/2 w-[1100px] h-[680px] bg-[#f4faf7] shadow-xl rounded-3xl flex flex-col border border-green-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-green-200 text-2xl font-semibold text-[#3A6953] bg-gradient-to-r from-green-100 to-white shadow">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center bg-[#6A8C73] text-white px-6 py-2 rounded-2xl shadow-md hover:bg-[#285236] transition"
        >
          <HiArrowLeft className="text-xl" />
        </button>
        <span className="text-xl font-semibold text-[#3A6953]">
          {userDetails?.name || "Direct Message"}
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-[#F0F8F4] scroll-smooth">
        {messages.map((msg, idx) => {
          const isMe = msg.from === user._id;
          const senderName = isMe ? user.name : userDetails?.name || "User";
          const firstName = senderName.split(" ")[0];

          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end`}>
              {!isMe && (
                <div className="flex-shrink-0 w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-2 text-[#3A6953] font-bold shadow">
                  {firstName[0]}
                </div>
              )}
              <div className={`relative max-w-[70%] ${isMe ? 'bg-gradient-to-br from-green-200 to-green-100' : 'bg-white'} p-4 rounded-2xl shadow-md flex flex-col`}>
                <span className="text-gray-800 break-words whitespace-pre-wrap">{msg.content}</span>
                <div className={`text-xs mt-2 ${isMe ? 'text-right' : 'text-left'} text-gray-400 font-medium`}>
                  {firstName} • {new Date(msg.timestamp).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
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
