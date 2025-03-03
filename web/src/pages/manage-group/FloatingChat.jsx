import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react"; // Icons for chat button

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hey there, please leave your details so we can contact you even if you are no longer on the site.", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
    }
  };

  return (
    <div>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-green-700 text-white p-4 rounded-full shadow-lg hover:bg-green-800 transition-all flex items-center justify-center"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chatbox */}
      {isOpen && (
        <div className="fixed bottom-5 right-6 w-80 bg-white rounded-lg shadow-lg border border-gray-300">
          {/* Chat Header */}
          <div className="bg-orange-500 text-white p-3 flex justify-between items-center rounded-t-lg">
            <span className="font-semibold">Paluwagan Group Chat</span>
            <button onClick={toggleChat}>
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 h-60 overflow-y-auto bg-orange-50">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                <span className={`inline-block p-2 rounded-lg text-sm ${msg.sender === "user" ? "bg-orange-300 text-black" : "bg-white border border-gray-300"}`}>
                  {msg.text}
                </span>
              </div>
            ))}           
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-gray-300 flex items-center">
            <input
              type="text"
              placeholder="Write your message..."
              className="flex-1 p-2 border border-gray-300 rounded-md"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="ml-2 text-orange-500">
              <MessageCircle size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
