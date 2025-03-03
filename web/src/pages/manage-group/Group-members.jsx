import React, { useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaCalendarAlt } from "react-icons/fa";
import { MdCheckCircle } from "react-icons/md";
import { FaArrowsRotate } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import { MessageCircle } from "lucide-react"; // ✅ Floating button icon
import AddMemberModal from "./AddMemberModal";
import MemberInfoModal from "./MemberInfoModal";
import FloatingChat from "./FloatingChat"; // ✅ Importing FloatingChat


const GroupMembers = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const navigate = useNavigate();

  const members = [
    { account: "2341421", name: "Ahmed Rashdan", date: "29 July 2023", time: "10:20 pm", month: "January" },
    { account: "3411421", name: "Ali Alhamdan", date: "29 July 2023", time: "10:20 pm", month: "February" },
    { account: "2341121", name: "Mona Alghafar", date: "29 July 2023", time: "10:20 pm", month: "March" },
    { account: "2341421", name: "Moustafa Adel", date: "29 July 2023", time: "10:20 pm", month: "April" },
    { account: "2341421", name: "Jhon Neleson", date: "29 July 2023", time: "10:20 pm", month: "June" },
    { account: "2341421", name: "Kadi Manela", date: "29 July 2023", time: "10:20 pm", month: "July" },
  ];

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

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
            src="/assets/images (2).jpg"
            alt="Paluwagan Group"
            className="w-[190px] h-[200px] rounded-[20px]"
          />
        </div>

        <div className="flex-1 mt-6 lg:mt-2">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Bangke Save Paluwagan</h1>
          <p className="text-gray-600 text-sm">
            Be a responsible member in this group, be active on contribution period.
          </p>

          <div className="grid grid-cols-2 gap-x-1 gap-y-4 mt-3 text-gray-700">
            <div className="flex items-center"><FaUsers className="text-[#3A6953] mr-2" /><span className="text-[#6A8C73]">12 Slots</span></div>
            <div className="flex items-center ml-[-100px]"><FaUsers className="text-[#3A6953] mr-2" /><span className="text-[#6A8C73]">2 Available Slots</span></div>
            <div className="flex items-center"><FaArrowsRotate className="text-[#3A6953] mr-2" /><span className="text-[#6A8C73]">₱2,300 Monthly</span></div>
            <div className="flex items-center ml-[-100px]"><FaCalendarAlt className="text-[#3A6953] mr-2" /><span className="text-[#6A8C73]">Start Date: Nov 1, 2024</span></div>
            <div className="flex items-center"><MdCheckCircle className="text-[#3A6953] mr-2" /><span className="text-[#6A8C73]">Active</span></div>
            <div className="flex items-center ml-[-100px]"><FaCalendarAlt className="text-[#3A6953] mr-2" /><span className="text-[#6A8C73]">End Date: Nov 1, 2025</span></div>
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
              onClick={() => navigate("/manage-group/transactions")}
            >
              View Transaction
            </button>
          </div>
        </div>

        {showModal && <AddMemberModal onClose={() => setShowModal(false)} />}

        <div className="overflow-hidden rounded-lg text-center">
          <table className="w-full text-gray-600 border-collapse">
            <thead className="bg-gray-100 text-[#6A8C73]">
              <tr>
                <th className="p-4 border-b">Account Number</th>
                <th className="p-4 border-b">Name</th>
                <th className="p-4 border-b">Date Joined</th>
                <th className="p-4 border-b">Time Joined</th>
                <th className="p-4 border-b">Assigned Month</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr key={`${member.account}-${index}`} className="border-b hover:bg-gray-50" onClick={() => handleMemberClick(member)}>
                  <td className="p-4 text-[#3A6953] font-semibold">{member.account}</td>
                  <td className="p-4">{member.name}</td>
                  <td className="p-4">{member.date}</td>
                  <td className="p-4">{member.time}</td>
                  <td className="p-4"><span className="bg-[#D4E8DB] text-[#3A6953] px-6 py-1 rounded-full text-sm">{member.month}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMember && <MemberInfoModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
      
      {/* Floating Chat */}
      <FloatingChat />
    </div>
  );
};

export default GroupMembers;
