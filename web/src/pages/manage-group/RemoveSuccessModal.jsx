import React from "react";
import { FaRegCircleCheck } from "react-icons/fa6";

const RemoveSuccessModal = ({ onClose, member }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <FaRegCircleCheck className="text-[#6A8C73] text-8xl" />
        </div>

        {/* Message */}
        <p className="text-[#3A6953] font-semibold text-lg mt-4">
          {member} has been removed from the Paluwagan group, Successfully!
        </p>

        {/* Actions */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-[150px] px-4 py-2 bg-[#6A8C73] text-white rounded-md hover:bg-[#3A6953]"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveSuccessModal;
