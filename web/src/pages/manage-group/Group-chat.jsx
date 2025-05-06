import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:5050");

const GroupChat = () => {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTyping = () => {
    socket.emit("typing", { groupId, user: user.name });
  };

  useEffect(() => {
    if (!groupId || !user?._id) return;

    fetch(`http://localhost:5050/api/chat/group/${groupId}`)
      .then((res) => res.json())
      .then(setMessages);

    fetch(`http://localhost:5050/api/chat/group/${groupId}/mark-read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id }),
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

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const uploadFileAndSend = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5050/api/upload-chat-file", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.url) {
      await fetch(`http://localhost:5050/api/chat/group/${groupId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          sender: user._id,
          type: "file",
          content: data.url,
        }),
      });
      setFile(null);
    }
  };

  const sendMessage = async () => {
    if (file) await uploadFileAndSend();
    if (!input.trim()) return;

    await fetch(`http://localhost:5050/api/chat/group/${groupId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId,
        sender: user._id,
        type: "text",
        content: input,
      }),
    });

    setInput("");
  };

  return (
    <div className="fixed top-[100px] left-1/2 transform -translate-x-1/2 w-[800px] h-[600px] bg-white shadow-xl rounded-3xl flex flex-col border border-green-200 overflow-hidden">
  {/* Header */}
  <div className="px-6 py-4 border-b border-green-200 text-2xl font-semibold text-[#3A6953]">
    Group Chat
  </div>

  {/* Messages Area */}
  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-[#F0F8F4] scroll-smooth">
    {messages.map((msg) => (
      <div
        key={msg._id}
        className={`p-3 rounded-xl text-sm max-w-[70%] break-words whitespace-pre-wrap ${
          msg.sender === user._id || msg.sender?._id === user._id
            ? "bg-[#C9EDD7] ml-auto text-right"
            : "bg-white border border-gray-200"
        }`}
      >
        {msg.type === "file" ? (
          <a
            href={msg.content}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            📎 View Attachment
          </a>
        ) : (
          <span className="text-gray-800">{msg.content}</span>
        )}
      </div>
    ))}
    <div ref={chatRef} />
  </div>

  {/* Typing Indicator */}
  {typingUsers.length > 0 && (
    <div className="text-sm text-gray-500 px-6 py-1">
      {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
    </div>
  )}

  {/* Input Area */}
  <div className="px-6 py-4 border-t border-green-200 flex gap-3 bg-white items-center">
    <input
      value={input}
      onChange={(e) => {
        setInput(e.target.value);
        handleTyping();
      }}
      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-green-600"
      placeholder="Type a message..."
    />

    <label className="text-sm text-gray-700 cursor-pointer">
      <input type="file" onChange={handleFileChange} className="hidden" />
      <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
        Choose File
      </span>
      {file && <span className="ml-2 text-green-600 font-medium">{file.name}</span>}
    </label>

    <button
      onClick={sendMessage}
      className="px-6 py-2 rounded-full bg-[#3A6953] text-white font-semibold hover:bg-green-800 transition-all"
    >
      Send
    </button>
  </div>
</div>
  );
};

export default GroupChat;
