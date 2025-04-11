import React from "react";
import { BsPersonSquare } from "react-icons/bs";

const ConfirmAddMemberModal = ({ member, onClose, onAdd }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-4">
          <BsPersonSquare className="text-[#3A6953] text-2xl" />
          <h2 className="text-xl font-bold text-[#3A6953]">Add a Member</h2>
        </div>
        <p className="text-[#3A6953] text-sm mb-4">
          Click the add button to confirm adding this person to the group.
        </p>

        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          <img
            src="/assets/Profile.jpg" // Replace with actual image source
            alt="User Avatar"
            className="w-24 h-24 rounded-full border border-[#3A6953] ml-[-302px]"
          />
        </div>

        {/* Account Info */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#3A6953]">Account Number*</label>
          <input
            type="text"
            value={member.userId || member._id}
            disabled
            className="w-full mt-2 px-3 py-2 border border-[#99C6A9] rounded-md bg-gray-50 text-[#3A6953]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#3A6953]">Account Full Name*</label>
          <input
            type="text"
            value={member.fullName}
            disabled
            className="w-full mt-2 px-3 py-2 border border-[#99C6A9] rounded-md bg-gray-50 text-[#3A6953]"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="w-[150px] px-4 py-2 border border-[#6A8C73]-400 text-green-600 rounded-md hover:bg-[#6A8C73]-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onAdd(member)}
            className="w-[150px] px-4 py-2 bg-[#6A8C73] text-white rounded-md hover:bg-[#3A6953]"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAddMemberModal;
