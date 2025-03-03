import React, { useState } from "react";
import { BsPersonSquare } from "react-icons/bs";
import ConfirmAddMemberModal from "./ConfirmAddMemberModal";

const AddMemberModal = ({ onClose, onFinalAdd }) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmStep, setConfirmStep] = useState(false);

  const handleConfirm = () => {
    if (!accountNumber || !fullName) {
      alert("Please fill in all required fields.");
      return;
    }

    setConfirmStep(true);
  };

  return confirmStep ? (
    <ConfirmAddMemberModal
      member={{ accountNumber, fullName }}
      onClose={onClose}
      onAdd={onFinalAdd}
    />
  ) : (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-4">
          <BsPersonSquare className="text-[#3A6953] text-2xl" />
          <h2 className="text-xl font-bold text-[#3A6953]">Add a Member</h2>
        </div>
        <p className="text-[#3A6953] text-sm mb-4">
          Enter the info below to search and add the member to the group.
        </p>

        {/* Input Fields */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#3A6953]">Account Number*</label>
          <input
            type="text"
            placeholder="e.g. 125156897795"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#99C6A9]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#3A6953]">Account Full Name*</label>
          <input
            type="text"
            placeholder="e.g. Lara Jean Santos"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#99C6A9]"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="w-[150px] px-4 py-2 border border-[#6A8C73]-400 text-green-600 rounded-md hover:bg-[#6A8C73]-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="w-[150px] px-4 py-2 bg-[#6A8C73] text-white rounded-md hover:bg-[#3A6953]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
