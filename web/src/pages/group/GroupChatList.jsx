import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Users, Search } from "lucide-react";

const globalStyle = `
  html, body {
    margin: 0;
    padding: 0;
    background: #d6ede3 !important;
    min-height: 100vh;
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  }
`;

const GroupChatList = () => {
  const [allChats, setAllChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!document.getElementById('wulapal-global-style')) {
      const style = document.createElement('style');
      style.id = 'wulapal-global-style';
      style.innerHTML = globalStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsRes = await fetch("http://localhost:5050/api/groups");
        const groupsData = await groupsRes.json();

        const userGroups = groupsData.filter(
          (group) =>
            group.handler === user._id ||
            group.members.some((member) => member.userId === user._id)
        );

        const formattedGroups = userGroups.map((group) => ({
          ...group,
          type: "group",
          lastActivity: group.updatedAt || group.createdAt,
        }));

        const messagesRes = await fetch(`http://localhost:5050/api/messages/conversation/${user._id}`);
        const messagesData = await messagesRes.json();

        const conversations = messagesData.reduce((acc, message) => {
          const otherUserId = message.from === user._id ? message.to : message.from;
          if (!acc[otherUserId]) {
            acc[otherUserId] = {
              lastMessage: message,
              userId: otherUserId,
              type: "direct",
              lastActivity: message.timestamp,
            };
          }
          return acc;
        }, {});

        const directChats = await Promise.all(
          Object.values(conversations).map(async (chat) => {
            try {
              const userRes = await fetch(`http://localhost:5050/api/users/${chat.userId}`);
              const userData = await userRes.json();
              return {
                ...chat,
                name: userData.name,
              };
            } catch (err) {
              console.error(`Failed to fetch user details for ${chat.userId}:`, err);
              return {
                ...chat,
                name: "Unknown User",
              };
            }
          })
        );

        const allChats = [...formattedGroups, ...directChats].sort(
          (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)
        );

        setAllChats(allChats);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);

  const filteredChats = allChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#d6ede3" }}>
      <div className="max-w-4xl w-full mx-auto mt-16 px-4">
        <div className="bg-white rounded-2xl shadow-xl px-6 py-8 max-h-[75vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#3A6953] flex items-center gap-2">
              <MessageCircle size={28} className="text-[#3A6953]" /> Chats
            </h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-1.5 rounded-full border border-gray-200 focus:outline-none focus:border-[#3A6953] focus:ring-1 focus:ring-[#3A6953] w-64 bg-[#f6fbf8] text-[#3A6953] placeholder:text-gray-400 text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>

          <div className="overflow-y-auto space-y-2 pr-2" style={{ flex: 1 }}>
            {filteredChats.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 italic">
                  {searchQuery ? "No chats found matching your search." : "No chats yet."}
                </p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat._id || chat.userId}
                  className="flex items-center justify-between px-4 py-3 rounded-lg shadow-sm border border-[#e3f2ec] bg-[#f6fbf8] transition-all duration-200 cursor-pointer hover:shadow-md hover:border-[#3A6953]/30"
                  onClick={() =>
                    navigate(chat.type === "group" ? `/groupchat/${chat._id}` : `/message/${chat.userId}`)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-full ${chat.type === "group" ? "bg-[#3A6953]/10" : "bg-[#6A8C73]/10"}`}>
                      {chat.type === "group" ? (
                        <Users size={22} className="text-[#3A6953]" />
                      ) : (
                        <MessageCircle size={22} className="text-[#6A8C73]" />
                      )}
                    </div>
                    <div>
                      <span className="text-base font-semibold text-[#22543d]">{chat.name}</span>
                      <p className="text-sm text-[#6A8C73] font-medium">
                        {chat.type === "group" ? "Group Chat" : "Direct Message"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(chat.lastActivity).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatList;
