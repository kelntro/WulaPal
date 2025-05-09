import React, { useState, useEffect } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { useNavigate, useParams } from "react-router-dom";
import { FaUsers, FaCalendarAlt } from "react-icons/fa";
import { MdCheckCircle } from "react-icons/md";
import { FaArrowsRotate } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import { MessageCircle } from "lucide-react"; // ✅ Floating button icon
import AddMemberModal from "./AddMemberModal";
import MemberInfoModal from "./MemberInfoModal";
import FloatingChat from "./FloatingChat"; // ✅ Importing FloatingChat
import { io } from "socket.io-client";


const SERVER_URL = "http://localhost:5050";

const GroupMembers = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const socket = io(SERVER_URL);

  const currentUser = JSON.parse(localStorage.getItem("user")); 
  useEffect(() => {
    console.log("🔍 Fetching group details for ID:", groupId);
  
    if (!groupId) {
      console.error("❌ groupId is undefined! Cannot fetch group data.");
      return;
    }
  
    const fetchGroup = () => {
      fetch(`${SERVER_URL}/api/groups/${groupId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch group data. Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("✅ Group Data Received:", data);
          setGroup(data);
        })
        .catch((err) => {
          console.error("❌ Error fetching group:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    };
  
    // Initial fetch
    fetchGroup();
  
    // Listen for real-time updates
    socket.on("groupUpdated", (update) => {
      if (update.groupId === groupId) {
        console.log("🔄 Group updated:", update.message);
        fetchGroup(); // Re-fetch group data
      }
    });
  
    return () => {
      socket.off("groupUpdated");
    };
  }, [groupId]);

  if (loading) {
    return (
      <div className="w-[1150px] mx-auto bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-center text-gray-500 mt-5">🔄 Loading group details...</h1>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="w-[1150px] mx-auto bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-red-500 text-center font-bold mt-5">
          ❌ Group not found or failed to load. Check console logs.
        </h1>
      </div>
    );
  }

  return (
    <div className="transition-all duration-300 w-[1150px] mx-auto bg-white p-4 rounded-lg shadow-md">
      {/* Header Section */}
      <div className="w-full max-w-6xl mx-auto p-2 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center bg-[#6A8C73] text-white px-6 py-2 rounded-2xl shadow-md hover:bg-[#285236] transition"
        >
          <HiArrowLeft className="text-xl" />
        </button>
      </div>

      {/* Content Section */}
      <div className="w-full max-w-6xl mx-auto mt-1 p-4 flex flex-wrap lg:flex-nowrap gap-[10px]">
        <div className="w-full lg:w-[200px]">
          <img
            src={group.image || "/assets/default.jpg"}
            alt={group.name}
            className="w-[190px] h-[200px] rounded-[20px]"
          />
        </div>

        <div className="flex-1 mt-6 lg:mt-2">
          <h1 className="text-4xl font-bold text-green-900 mb-2">{group.name}</h1>
          <p className="text-gray-600 text-sm">
            {group.description || "Be a responsible member in this group, be active on contribution period."}
          </p>

          <div className="grid grid-cols-2 gap-x-1 gap-y-4 mt-3 text-gray-700">
            <div className="flex items-center"><FaUsers className="text-[#3A6953] mr-2" /><span className="text-[#6A8C73]">{group.slots} Slots</span></div>
            <div className="flex items-center ml-[-100px]"><FaUsers className="text-[#3A6953] mr-2" /><span className="text-[#6A8C73]">{group.members.length} Members</span></div>
            <div className="flex items-center"><FaArrowsRotate className="text-[#3A6953] mr-2" /><span className="text-[#6A8C73]">₱{group.contributionAmount} {group.frequency}</span></div>
            <div className="flex items-center ml-[-100px]"><FaCalendarAlt className="text-[#3A6953] mr-2" /><span className="text-[#6A8C73]">Start Date: {group.startDate ? new Date(group.startDate).toLocaleDateString() : "N/A"}</span></div>
            <div className="flex items-center"><MdCheckCircle className="text-[#3A6953] mr-2" /><span className="text-[#6A8C73]">{group.status}</span></div>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="p-6 w-full max-w-6xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-green-900">List of Members</h2>
          <div className="flex space-x-2">
            <button
              className="bg-[#6A8C73] text-white px-4 py-2 rounded-[20px] flex items-center gap-1 hover:bg-[#3A6953]"
              onClick={() => setShowModal(true)}
            >
              <FiPlus /> Add Member
            </button>
            <button
              className="bg-[#6A8C73] text-white px-4 py-2 rounded-[20px] hover:bg-[#3A6953]"
              onClick={() => navigate(`/manage-group/transactions/${group._id}`)}
            >
              View Transaction
            </button>
            <button
              className="bg-[#6A8C73] text-white px-4 py-2 rounded-[20px] hover:bg-[#3A6953]"
              onClick={() => navigate(`/manage-group/chat/${group._id}`)}
            >
              Group Chat
            </button>

            </div>
        </div>

        {showModal && (
        <AddMemberModal
          groupId={group._id} // ✅ Ensure groupId is passed
          onClose={() => setShowModal(false)}
          onMemberAdded={(updatedMembers) => setGroup({ ...group, members: updatedMembers })}
        />
      )}

<div className="overflow-hidden rounded-lg text-center">
    <table className="w-full text-gray-600 border-collapse">
        <thead className="bg-gray-100 text-[#3A6953]">
            <tr>
                <th className="p-4 border-b">User ID</th>
                <th className="p-4 border-b">Name</th>
                <th className="p-4 border-b">Date Joined</th>
                <th className="p-4 border-b">Time Joined</th>
            </tr>
        </thead>
        <tbody>
    {group.members.length > 0 ? (
        group.members.map((member) => (
            <tr key={member.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-[#3A6953] font-semibold">
                  {member.id}
                </td>
                <td className="p-4">{member.name || "Unknown"}</td>
                <td className="p-4">{member.dateJoined || "N/A"}</td>
                <td className="p-4">{member.timeJoined || "N/A"}</td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="4" className="p-4 text-gray-500">No members yet</td>
        </tr>
    )}
</tbody>

    </table>
</div>


<div className="p-6 w-full max-w-6xl mx-auto mt-10 bg-[#f5faf7] rounded-xl border border-[#d9e5db] shadow-sm">
  <h2 className="text-2xl font-bold text-[#3A6953] mb-6 text-center">
    📊 Group Contribution Details
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
    {/* Contribution Start Date */}
    <div className="bg-white rounded-lg p-4 border shadow">
      <p className="text-sm text-gray-500 mb-1">Contribution Started</p>
      <p className="text-lg text-[#3A6953] font-semibold">
        {group.payouts?.length > 0
          ? new Date(group.payouts[0].payoutDate).toLocaleDateString()
          : "Not Started"}
      </p>
    </div>

    {/* Current Payout Recipient */}
    <div className="bg-white rounded-lg p-4 border shadow">
      <p className="text-sm text-gray-500 mb-1">Current Payout Recipient</p>
      <p className="text-lg text-[#3A6953] font-semibold">
      {group.payouts?.length > 0
  ? group.members.find((m) => m.id === group.payouts[group.currentPayoutIndex]?.recipientId)?.name || "N/A"
          : "Not Assigned"}
      </p>
    </div>

    {/* Next Payout Date */}
    <div className="bg-white rounded-lg p-4 border shadow">
      <p className="text-sm text-gray-500 mb-1">Next Payout Date</p>
      <p className="text-lg text-[#3A6953] font-semibold">
        {group.nextPayoutDate
          ? new Date(group.nextPayoutDate).toLocaleDateString()
          : "Not Set"}
      </p>
    </div>
  </div>
</div>

      </div>

      {selectedMember && <MemberInfoModal member={selectedMember} onClose={() => setSelectedMember(null)} />}

{/* Floating Chat */}
{group && currentUser && (
  <FloatingChat groupId={group._id} currentUser={currentUser} />
)}

    </div>
  );
};

export default GroupMembers;
