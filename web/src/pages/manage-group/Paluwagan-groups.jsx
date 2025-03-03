import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { HiOutlineSearch } from "react-icons/hi";
import { FaUsers, FaCheckCircle } from "react-icons/fa";
import { FaArrowsRotate } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import CreateGroupModal from "./CreateGroupModal";

const PaluwaganGroups = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // Move useNavigate inside the component

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
            className="w-[650px] p-2 pl-10 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6A8C73]"
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
      <div className="flex flex-wrap justify-center gap-[20px] mr-[30px]">

        {/* Paluwagan Card 1 */}
        <div className="bg-white rounded-[20px] shadow-lg p-4 flex-1 min-w-[300px] max-w-[350px]">
          <div className="w-full h-[140px] rounded-t-[20px] overflow-hidden">
            <img src="/assets/images (2).jpg" alt="Paluwagan Group" className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <h2 className="text-lg font-bold text-[#285236]">Pagkaon Ni Saving Paluwagan</h2>
            <p className="text-gray-600 text-sm mb-2">Be a responsible member in this group be active on contribution period.</p>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaUsers className="mr-2 text-[#3A6953]" /> 12 Slots
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaArrowsRotate className="mr-2 text-[#3A6953]" /> ₱2,300 Monthly
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-4">
              <FaCheckCircle className="mr-2 text-[#3A6953]" /> Active
            </div>
            <button 
              className="bg-[#6A8C73] text-white w-full px-4 py-2 rounded-[20px] shadow-md hover:bg-[#3A6953] transition"
              onClick={() => navigate("/manage-group/members")} // Ensure the correct route
              >
              View Group
            </button>
          </div>
        </div>

        {/* Paluwagan Card 2 */}
        <div className="bg-white rounded-[20px] shadow-lg p-4 flex-1 min-w-[300px] max-w-[350px]">
          <div className="w-full h-[140px] rounded-t-[20px] overflow-hidden">
            <img src="/assets/images (3).jpg" alt="Paluwagan Group" className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <h2 className="text-lg font-bold text-[#285236]">Save Inasal Saving Paluwagan</h2>
            <p className="text-gray-600 text-sm mb-2">Be a responsible member in this group be active on contribution period.</p>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaUsers className="mr-2 text-[#3A6953]" /> 12 Slots
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaArrowsRotate className="mr-2 text-[#3A6953]" /> ₱2,300 Monthly
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-4">
              <FaCheckCircle className="mr-2 text-[#3A6953]" /> Active
            </div>
            <button className="bg-[#6A8C73] text-white w-full px-4 py-2 rounded-[20px] shadow-md hover:bg-[#3A6953] transition">
              View Group
            </button>
          </div>
        </div>

        {/* Paluwagan Card 3 */}
        <div className="bg-white rounded-[20px] shadow-lg p-4 flex-1 min-w-[300px] max-w-[350px]">
          <div className="w-full h-[140px] rounded-t-[20px] overflow-hidden">
            <img src="/assets/money (3).jpg" alt="Paluwagan Group" className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <h2 className="text-lg font-bold text-[#285236]">Travel mang Saving Paluwagan</h2>
            <p className="text-gray-600 text-sm mb-2">Be a responsible member in this group be active on contribution period.</p>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaUsers className="mr-2 text-[#3A6953]" /> 12 Slots
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaArrowsRotate className="mr-2 text-[#3A6953]" /> ₱2,300 Monthly
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-4">
              <FaCheckCircle className="mr-2 text-[#3A6953]" /> Active
            </div>
            <button className="bg-[#6A8C73] text-white w-full px-4 py-2 rounded-[20px] shadow-md hover:bg-[#3A6953] transition">
              View Group
            </button>
          </div>
        </div>

        {/* Paluwagan Card 4 */}
        <div className="bg-white rounded-[20px] shadow-lg p-4 flex-1 min-w-[300px] max-w-[350px]">
          <div className="w-full h-[140px] rounded-t-[20px] overflow-hidden">
            <img src="/assets/Final_login.png" alt="Paluwagan Group" className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <h2 className="text-lg font-bold text-[#285236]">Baon mangaon Saving Paluwagan</h2>
            <p className="text-gray-600 text-sm mb-2">Be a responsible member in this group be active on contribution period.</p>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaUsers className="mr-2 text-[#3A6953]" /> 12 Slots
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaArrowsRotate className="mr-2 text-[#3A6953]" /> ₱2,300 Monthly
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-4">
              <FaCheckCircle className="mr-2 text-[#3A6953]" /> Active
            </div>
            <button className="bg-[#6A8C73] text-white w-full px-4 py-2 rounded-[20px] shadow-md hover:bg-[#3A6953] transition">
              View Group
            </button>
          </div>
        </div>

        {/* Paluwagan Card 5 */}
        <div className="bg-white rounded-[20px] shadow-lg p-4 flex-1 min-w-[300px] max-w-[350px]">
          <div className="w-full h-[140px] rounded-t-[20px] overflow-hidden">
            <img src="/assets/images (2).jpg" alt="Paluwagan Group" className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <h2 className="text-lg font-bold text-[#285236]">Food Bundle Saving Paluwagan</h2>
            <p className="text-gray-600 text-sm mb-2">Be a responsible member in this group be active on contribution period.</p>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaUsers className="mr-2 text-[#3A6953]" /> 12 Slots
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaArrowsRotate className="mr-2 text-[#3A6953]" /> ₱2,300 Monthly
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-4">
              <FaCheckCircle className="mr-2 text-[#3A6953]" /> Active
            </div>
            <button className="bg-[#6A8C73] text-white w-full px-4 py-2 rounded-[20px] shadow-md hover:bg-[#3A6953] transition">
              View Group
            </button>
          </div>
        </div>

        {/* Paluwagan Card 6 */}
        <div className="bg-white rounded-[20px] shadow-lg p-4 flex-1 min-w-[300px] max-w-[350px]">
          <div className="w-full h-[140px] rounded-t-[20px] overflow-hidden">
            <img src="/assets/images (2).jpg" alt="Paluwagan Group" className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <h2 className="text-lg font-bold text-[#285236]">Food Bundle Saving Paluwagan</h2>
            <p className="text-gray-600 text-sm mb-2">Be a responsible member in this group be active on contribution period.</p>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaUsers className="mr-2 text-[#3A6953]" /> 12 Slots
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaArrowsRotate className="mr-2 text-[#3A6953]" /> ₱2,300 Monthly
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-4">
              <FaCheckCircle className="mr-2 text-[#3A6953]" /> Active
            </div>
            <button className="bg-[#6A8C73] text-white w-full px-4 py-2 rounded-[20px] shadow-md hover:bg-[#3A6953] transition">
              View Group
            </button>
          </div>
        </div>

        {/* Paluwagan Card 7 */}
        <div className="bg-white rounded-[20px] shadow-lg p-4 flex-1 min-w-[300px] max-w-[350px]">
          <div className="w-full h-[140px] rounded-t-[20px] overflow-hidden">
            <img src="/assets/images (2).jpg" alt="Paluwagan Group" className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <h2 className="text-lg font-bold text-[#285236]">Food Bundle Saving Paluwagan</h2>
            <p className="text-gray-600 text-sm mb-2">Be a responsible member in this group be active on contribution period.</p>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaUsers className="mr-2 text-[#3A6953]" /> 12 Slots
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaArrowsRotate className="mr-2 text-[#3A6953]" /> ₱2,300 Monthly
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-4">
              <FaCheckCircle className="mr-2 text-[#3A6953]" /> Active
            </div>
            <button className="bg-[#6A8C73] text-white w-full px-4 py-2 rounded-[20px] shadow-md hover:bg-[#3A6953] transition">
              View Group
            </button>
          </div>
        </div>

        {/* Paluwagan Card 8 */}
        <div className="bg-white rounded-[20px] shadow-lg p-4 flex-1 min-w-[300px] max-w-[350px]">
          <div className="w-full h-[140px] rounded-t-[20px] overflow-hidden">
            <img src="/assets/images (2).jpg" alt="Paluwagan Group" className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <h2 className="text-lg font-bold text-[#285236]">Food Bundle Saving Paluwagan</h2>
            <p className="text-gray-600 text-sm mb-2">Be a responsible member in this group be active on contribution period.</p>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaUsers className="mr-2 text-[#3A6953]" /> 12 Slots
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-1">
              <FaArrowsRotate className="mr-2 text-[#3A6953]" /> ₱2,300 Monthly
            </div>
            <div className="flex items-center text-[#6A8C73] text-sm mb-4">
              <FaCheckCircle className="mr-2 text-[#3A6953]" /> Active
            </div>
            <button className="bg-[#6A8C73] text-white w-full px-4 py-2 rounded-[20px] shadow-md hover:bg-[#3A6953] transition">
              View Group
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PaluwaganGroups;
