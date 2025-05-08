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
  const [groupDetails, setGroupDetails] = useState(null);
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

    // Fetch group details
    fetch(`http://localhost:5050/api/groups/${groupId}`)
      .then((res) => res.json())
      .then(setGroupDetails)
      .catch(err => console.error("Error fetching group details:", err));

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
    <div className="fixed top-[100px] left-1/2 transform -translate-x-1/2 w-[800px] h-[600px] bg-[#f4faf7] shadow-xl rounded-3xl flex flex-col border border-green-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-green-200 text-2xl font-semibold text-[#3A6953] bg-gradient-to-r from-green-100 to-white shadow">
        {/* <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-[#3A6953] font-bold shadow">
          {groupDetails?.name?.[0] || 'G'}
        </div> */}
        <span>{groupDetails?.name || "Group Chat"}</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-[#F0F8F4] scroll-smooth">
        {messages.map((msg) => {
          const isMe = msg.sender === user._id || msg.sender?._id === user._id;
          const firstName = msg.sender?.name?.split(' ')[0] || 'Unknown';
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end`}>
              {!isMe && (
                <div className="flex-shrink-0 w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-2 text-[#3A6953] font-bold shadow">
                  {firstName[0]}
                </div>
              )}
              <div className={`relative max-w-[70%] ${isMe ? 'bg-gradient-to-br from-green-200 to-green-100' : 'bg-white'} p-4 rounded-2xl shadow-md flex flex-col`}>
                {msg.type === "file" ? (
                  <a href={msg.content} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    📎 View Attachment
                  </a>
                ) : (
                  <span className="text-gray-800 break-words whitespace-pre-wrap">{msg.content}</span>
                )}
                <div className={`text-xs mt-2 ${isMe ? 'text-right' : 'text-left'} text-gray-400 font-medium`}>
                  {firstName} • {new Date(msg.timestamp).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="text-sm text-gray-500 px-6 py-1 flex items-center gap-2">
          <span className="animate-pulse">💬</span>
          <span>{typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...</span>
        </div>
      )}

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
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleTyping();
          }}
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

export default GroupChat;
