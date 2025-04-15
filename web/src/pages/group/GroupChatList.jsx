import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const GroupChatList = () => {
  const [groups, setGroups] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/groups");
        const data = await res.json();

        const ownedGroups = data
          .filter((group) => group.handler === user._id)
          .reverse(); // most recent on top

        setGroups(ownedGroups);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-[#3A6953] mb-6 flex items-center gap-2">
        <MessageCircle size={28} /> Group Chats
      </h1>

      {groups.length === 0 ? (
        <p className="text-gray-500 italic">You haven’t created any groups yet.</p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group._id}
              className="flex justify-between items-center bg-[#F4F8F7] p-4 rounded-lg shadow-sm hover:bg-[#e8f2eb] cursor-pointer transition"
              onClick={() => navigate(`/groupchat/${group._id}`)}
            >
              <div>
                <h2 className="text-lg font-semibold text-[#3A6953]">{group.name}</h2>
                <p className="text-sm text-gray-600">{group.description || "No description provided."}</p>
              </div>
              <MessageCircle size={20} className="text-[#6A8C73]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupChatList;
