import React, { useState } from "react";
import { BsPersonSquare } from "react-icons/bs";
import ReportMemberModal from "./ReportMemberModal";

const MemberInfoModal = ({ member, onClose }) => {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <>
      {!showReportModal ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-[#3A6953] text-lg font-bold flex items-center gap-2">
                <span>
                <BsPersonSquare className="text-[#3A6953] text-2xl" />
                </span>
                Member Information
            </h2>
            </div>

            
             {/* Profile Image */}
            <div className="flex justify-center my-4">
            <img
                src="/assets/images (2).jpg"
                alt="Profile"
                className="w-24 h-24 rounded-full border border-[#3A6953] ml-[-365px]"
            />
            </div>

            {/* Member Details */}
            <div className="space-y-3">
            <div>
                <label className="block text-sm font-medium text-[#3A6953]">Account Number*</label>
                <input type="text" value={member.account} readOnly className="w-full mt-2 px-3 py-2 border border-[#99C6A9] rounded-md bg-gray-50 text-[#3A6953]" />
            </div>
            <div>
                <label className="block text-sm font-medium text-[#3A6953]">Account Full Name*</label>
                <input type="text" value={member.name} readOnly className="w-full mt-2 px-3 py-2 border border-[#99C6A9] rounded-md bg-gray-50 text-[#3A6953]" />
            </div>
            <div>
                <label className="block text-sm font-medium text-[#3A6953]">Date Joined*</label>
                <input type="text" value={member.date} readOnly className="w-full mt-2 px-3 py-2 border border-[#99C6A9] rounded-md bg-gray-50 text-[#3A6953]" />
            </div>
            <div>
                <label className="block text-sm font-medium text-[#3A6953]">Assigned Month*</label>
                <input type="text" value={member.month} readOnly className="w-full mt-2 px-3 py-2 border border-[#99C6A9] rounded-md bg-gray-50 text-[#3A6953]" />
            </div>
            </div>


            {/* Actions */}
            <div className="flex justify-between mt-6">
            <button onClick={onClose} className="w-[150px] px-4 py-2 border border-[#6A8C73]-400 text-green-600 rounded-md hover:bg-[#6A8C73]-300">
                Cancel
            </button>
              <button 
              onClick={() => setShowReportModal(true)} 
              className="w-[150px] bg-[#EB4335] text-white px-4 py-2 rounded-lg hover:bg-red-600">
                Report
              </button>
            </div>
          </div>
        </div>
      ) : (
        <ReportMemberModal onClose={() => setShowReportModal(false)} />
      )}
    </>
  );
};

export default MemberInfoModal;
