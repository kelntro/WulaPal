import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react"; // Icons for chat button
import { RiSendPlaneFill } from "react-icons/ri";

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === now.toDateString()) {
      return "Today";
    } else if (
      messageDate.toDateString() ===
      new Date(now.setDate(now.getDate() - 1)).toDateString()
    ) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const sendMessage = () => {
    if (input.trim() !== "") {
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const newMessage = {
        text: input,
        sender: "user",
        status: "Sending...",
        time: timestamp,
        date: now.toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput("");

      setTimeout(() => {
        setMessages((prevMessages) =>
          prevMessages.map((msg, index) =>
            index === prevMessages.length - 1 ? { ...msg, status: "Sent" } : msg
          )
        );
      }, 1000);
    }
  };

  return (
    <div>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-[#3A6953] text-white p-4 rounded-full shadow-lg hover:bg-green-800 transition-all flex items-center justify-center"
      >
        <MessageCircle size={28} />
      </button>

      {/* Chatbox */}
      {isOpen && (
        <div className="fixed bottom-5 right-6 w-[480px] bg-white rounded-lg shadow-lg border border-gray-300">
          {/* Chat Header */}
          <div className="bg-[#3A6953] text-white p-4 flex justify-between items-center rounded-t-lg">
            <span className="font-semibold text-lg">Paluwagan Group Chat</span>
            <button onClick={toggleChat}>
              <X size={22} className="text-white" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 h-[420px] overflow-y-auto bg-green-50">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">Start a conversation...</p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  {index === 0 || formatDate(messages[index - 1].date) !== formatDate(msg.date) ? (
                    <p className="text-center text-gray-400 text-xs my-2">{formatDate(msg.date)}</p>
                  ) : null}
                  <span
                    className={`inline-block p-3 rounded-lg text-sm ${
                      msg.sender === "user" ? "bg-[#6A8C73] text-white" : "bg-white border border-gray-300"
                    }`}
                  >
                    {msg.text}
                  </span>
                  {msg.sender === "user" && (
                    <p className="text-xs text-gray-500 mt-1">
                      {msg.status} • {msg.time}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-300 flex items-center">
            <input
              type="text"
              placeholder="Write your message..."
              className="flex-1 p-3 border border-gray-300 rounded-md"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="ml-2 text-[#3A6953]">
              <RiSendPlaneFill size={28} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
