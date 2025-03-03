import React, { useState } from "react";
import { BsPersonSquare } from "react-icons/bs";
import RemoveNoticeModal from "./RemoveNoticeModal";

const ReportMemberModal = ({ onClose }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [showRemoveNotice, setShowRemoveNotice] = useState(false);

  const reasons = [
    "Inappropriate Behavior",
    "Inactive in Contribution",
    "Lost Communication",
    "Etc.",
    "Inactive chu chu",
    "Others"
  ];

  const handleConfirm = () => {
    if (selectedReason && (selectedReason !== "Others" || otherReason)) {
      setShowRemoveNotice(true);
    }
  };

  const handleCloseAll = () => {
    setShowRemoveNotice(false);
    onClose(); // Close all modals including MemberInfoModal
  };

  return (
    <>
      {!showRemoveNotice ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-[#3A6953] text-lg font-bold flex items-center gap-2">
                <span>
                  <BsPersonSquare className="text-[#3A6953] text-2xl" />
                </span>
                Report Member
              </h2>
            </div>

            {/* Reason Selection */}
            <div className="mt-4">
              <p className="text-green-900 font-semibold">Select a reason why you reported this member.</p>
              <div className="mt-3 space-y-2">
                {reasons.map((reason, index) => (
                  <label key={index} className="flex items-center gap-2 cursor-pointer text-[#3A6953]">
                    <input
                      type="radio"
                      name="report-reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="text-green-600"
                    />
                    {reason}
                  </label>
                ))}
              </div>

              {/* Other Reason Input */}
              {selectedReason === "Others" && (
                <input
                  type="text"
                  placeholder="Specify your reason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  className="w-full mt-3 border-b-2 border-[#99C6A9] focus:outline-none focus:border-[#3A6953]"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-6">
              <button onClick={onClose} className="w-[150px] px-4 py-2 border border-[#6A8C73]-400 text-green-600 rounded-md hover:bg-[#6A8C73]-300">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="w-[150px] bg-[#EB4335] text-white px-4 py-2 rounded-lg hover:bg-red-600"
                disabled={!selectedReason || (selectedReason === "Others" && !otherReason)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : (
        <RemoveNoticeModal onClose={handleCloseAll} onRemove={() => setShowRemoveNotice(false)} />
      )}
    </>
  );
};

export default ReportMemberModal;
