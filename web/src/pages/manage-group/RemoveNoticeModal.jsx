import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RemoveSuccessModal from "./RemoveSuccessModal";

const RemoveNoticeModal = ({ onClose }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleRemove = () => {
    setShowSuccessModal(true);
  };

  return (
    <>
      {!showSuccessModal ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[600px] text-center">
            {/* Message */}
            <p className="text-[#3A6953] font-semibold text-lg">
              Your report has been submitted to WulaPal Admin. Do you want to remove this member from the group?
            </p>

            {/* Actions */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  navigate("/manage-group/members");
                  onClose?.(); // Ensuring modal closes properly
                }}
                className="w-[150px] px-4 py-2 border border-[#6A8C73]-400 text-green-600 rounded-md hover:bg-[#6A8C73]-300"
              >
                No
              </button>
              <button
                onClick={handleRemove}
                className="w-[150px] bg-[#EB4335] text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : (
        <RemoveSuccessModal onClose={onClose} />
      )}
    </>
  );
};

export default RemoveNoticeModal;
