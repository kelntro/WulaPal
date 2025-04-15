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
    <div className="w-full max-w-2xl mx-auto mt-6 bg-white shadow-lg rounded-lg flex flex-col">
      <div className="p-4 border-b text-xl font-bold text-green-800">Group Chat</div>

      <div className="h-[400px] overflow-y-scroll p-4 space-y-2 bg-gray-50 flex-1">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-2 rounded-lg max-w-[70%] break-words whitespace-pre-wrap ${
              msg.sender === user._id ? "bg-green-100 ml-auto" : "bg-white"
            }`}
          >
            {msg.type === "file" ? (
              <a
                href={msg.content}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline break-words"
              >
                📎 View Attachment
              </a>
            ) : (
              <div className="text-sm text-gray-700">{msg.content}</div>
            )}
          </div>
        ))}
        <div ref={chatRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="text-sm text-gray-500 pl-4 mb-2">
          {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
        </div>
      )}

      <div className="p-4 border-t flex flex-col sm:flex-row items-center gap-2">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border rounded-lg p-2 w-full"
          placeholder="Type a message..."
        />
        <input type="file" onChange={handleFileChange} className="text-sm" />
        <button
          onClick={sendMessage}
          className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default GroupChat;
