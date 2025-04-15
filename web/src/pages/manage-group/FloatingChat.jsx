import React, { useEffect, useState, useRef } from "react";
import { MessageCircle, X } from "lucide-react";
import { RiSendPlaneFill } from "react-icons/ri";
import io from "socket.io-client";

const socket = io("http://localhost:5050");

const FloatingChat = ({ groupId, currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const chatRef = useRef(null);

  // 🛡️ Guard to prevent early render
  if (!groupId || !currentUser || !currentUser._id) {
    console.warn("⛔ FloatingChat: missing groupId or currentUser._id");
    return null;
  }

  const toggleChat = () => {
    console.log("🟢 Floating Chat Icon Clicked");
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetch(`http://localhost:5050/api/chat/group/${groupId}`)
      .then((res) => res.json())
      .then(setMessages);

    fetch(`http://localhost:5050/api/chat/group/${groupId}/mark-read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser._id }),
    });

    socket.emit("join", groupId);

    socket.on("new-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", ({ user }) => {
      setTypingUsers((prev) => [...new Set([...prev, user])]);
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== user));
      }, 3000);
    });

    return () => {
      socket.off("new-message");
      socket.off("typing");
      socket.emit("leave", groupId);
    };
  }, [groupId]);

  useEffect(scrollToBottom, [messages]);

  const handleTyping = () => {
    socket.emit("typing", { groupId, user: currentUser.name });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    await fetch(`http://localhost:5050/api/chat/group/${groupId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId,
        sender: currentUser._id,
        type: "text",
        content: input,
      }),
    });

    setInput("");
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-[#3A6953] text-white p-4 rounded-full shadow-lg hover:bg-green-800 transition-all flex items-center justify-center"
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-5 right-6 w-[400px] bg-white rounded-lg shadow-lg border border-gray-300 z-50 flex flex-col">
          <div className="bg-[#3A6953] text-white p-4 flex justify-between items-center rounded-t-lg">
            <span className="font-semibold text-lg">Group Chat</span>
            <button onClick={toggleChat}>
              <X size={22} />
            </button>
          </div>

          <div className="p-4 h-[360px] overflow-y-auto bg-green-50">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`mb-2 ${
                  msg.sender === currentUser._id ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block p-3 rounded-lg text-sm ${
                    msg.sender === currentUser._id
                      ? "bg-[#6A8C73] text-white"
                      : "bg-white border border-gray-300"
                  }`}
                >
                  {msg.type === "file" ? (
                    <a
                      href={msg.content}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-blue-500"
                    >
                      📎 View Attachment
                    </a>
                  ) : (
                    msg.content
                  )}
                </span>
              </div>
            ))}
            <div ref={chatRef} />
          </div>

          {typingUsers.length > 0 && (
            <div className="text-xs text-gray-500 px-4">
              {typingUsers.join(", ")} typing...
            </div>
          )}

          <div className="p-4 border-t border-gray-300 flex items-center">
            <input
              type="text"
              placeholder="Write your message..."
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="ml-2 text-[#3A6953]"
            >
              <RiSendPlaneFill size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
