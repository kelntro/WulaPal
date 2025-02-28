import React, { useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { FaUsers, FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import CreateGroupModal from "./CreateGroupModal";

const PaluwaganGroups = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-2 sm:ml-[90px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#285236]">Paluwagan Groups</h1>
          <p className="text-[#6A8C73] font-normal">
            Here’s your Paluwagan groups and manage your own group.
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-3/4">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Quick Search..."
            className="w-[650px] p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6A8C73]"
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#3A6953] text-white px-4 py-2 pr-5 rounded-[20px] flex items-center shadow-md hover:bg-[#6A8C73] transition mr-6"
        >
          <span className="mr-1"><FiPlus /></span> Create a Paluwagan
        </button>
      </div>
      
      {/* Modal Component */}
      {showModal && <CreateGroupModal onClose={() => setShowModal(false)} />}

      {/* Paluwagan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-[20px] shadow-lg flex items-center">
          <img src="/assets/images (2).jpg" alt="Paluwagan Group" className="w-32 h-44 rounded-lg object-cover mr-4" />
          <div className="flex flex-col w-full">
            <h2 className="text-xl font-bold text-[#285236]">Bangke Saving Paluwagan</h2>
            <p className="text-gray-600 text-sm mb-2">Be a responsible member in this group be active on contribution period.</p>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1"><FaUsers className="mr-2" /> 12 Slots</div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1"><FaMoneyBillWave className="mr-2" /> ₱ 2,300 Monthly</div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-4"><FaCheckCircle className="mr-2 text-green-600" /> Active</div>
            <button className="bg-[#6A8C73] text-white w-[200px] px-4 py-2 rounded-[20px] shadow-md hover:bg-[#3A6953] transition self-start">View Group</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[20px] shadow-lg flex items-center">
          <img src="/assets/images (3).jpg" alt="Paluwagan Group" className="w-32 h-44 rounded-lg object-cover mr-4" />
          <div className="flex flex-col w-full">
            <h2 className="text-xl font-bold text-[#285236]">Travel Saving Paluwagan</h2>
            <p className="text-gray-600 text-sm mb-2">Be a responsible member in this group be active on contribution period.</p>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1"><FaUsers className="mr-2" /> 12 Slots</div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1"><FaMoneyBillWave className="mr-2" /> ₱ 2,300 Monthly</div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-4"><FaCheckCircle className="mr-2 text-green-600" /> Active</div>
            <button className="bg-[#6A8C73] text-white w-[200px] px-4 py-2 rounded-[20px] shadow-md hover:bg-[#3A6953] transition self-start">View Group</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[20px] shadow-lg flex items-center">
          <img src="/assets/money (3).jpg" alt="Paluwagan Group" className="w-32 h-44 rounded-lg object-cover mr-4" />
          <div className="flex flex-col w-full">
            <h2 className="text-xl font-bold text-[#285236]">Save Saving Paluwagan</h2>
            <p className="text-gray-600 text-sm mb-2">Be a responsible member in this group be active on contribution period.</p>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1"><FaUsers className="mr-2" /> 12 Slots</div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1"><FaMoneyBillWave className="mr-2" /> ₱ 2,300 Monthly</div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-4"><FaCheckCircle className="mr-2 text-green-600" /> Active</div>
            <button className="bg-[#6A8C73] text-white w-[200px] px-4 py-2 rounded-[20px] shadow-md hover:bg-[#3A6953] transition self-start">View Group</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaluwaganGroups;
