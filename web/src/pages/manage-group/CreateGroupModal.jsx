import React, { useState } from "react";
import { FaRegImage } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { HiUserGroup } from "react-icons/hi";
import "react-datepicker/dist/react-datepicker.css";

const CreateGroupModal = ({ onClose }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[600px] border border-gray-300">
        <div className="flex items-center mb-4 border-b pb-3">
          <span className="text-[#3A6953] text-2xl mr-3"><HiUserGroup /></span>
          <h2 className="text-xl font-bold text-[#3A6953]">Add Paluwagan Group</h2>
        </div>
        <p className="text-[#3A6953] text-sm mb-6">Create your Paluwagan profile for free in less than 5 minutes.</p>
        
        <form className="space-y-4">
          <div className="flex items-center">
            <label className="w-1/3 text-[#3A6953] font-medium">Paluwagan name*</label>
            <input type="text" placeholder="e.g. Linear" className="w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#99C6A9]" />
          </div>
          <div className="flex items-center">
            <label className="w-1/3 text-[#3A6953] font-medium">Monthly Contribution*</label>
            <input type="text" placeholder="e.g. 2,500" className="w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#99C6A9]" />
          </div>
          <div className="flex items-center">
            <label className="w-1/3 text-[#3A6953] font-medium">Profile image*</label>
            <div className="w-2/3 border p-4 flex flex-col items-center rounded-lg cursor-pointer hover:bg-gray-100">
              <FaRegImage className="text-gray-500 text-3xl mb-2" />
              <span className="text-gray-500">Click to upload or drag and drop</span>
              <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
            </div>
          </div>
          <div className="flex items-center">
            <label className="w-1/3 text-[#3A6953] font-medium">Date Contribution*</label>
            <div className="w-2/3 flex space-x-2">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className="p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#99C6A9] w-full"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                placeholderText="End Date"
                className="p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#99C6A9] w-full"
              />
            </div>
          </div>
          <div className="flex items-center">
            <label className="w-1/3 text-[#3A6953] font-medium">Open a Slots*</label>
            <input type="text" placeholder="Max. of 12 Slots" className="w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#99C6A9]" />
          </div>
          <div className="flex items-center">
            <label className="w-1/3 text-[#3A6953] font-medium">Description*</label>
            <textarea placeholder="Be a responsible member in this group be active on contribution period." className="w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#99C6A9]" rows="3"></textarea>
          </div>
          <div className="flex justify-between mt-6">
            <button type="button" className="w-[200px] px-6 py-2 border border-[#6A8C73]-400 rounded-lg text-[#6A8C73] hover:bg-[#6A8C73]-300" onClick={onClose}>Cancel</button>
            <button type="submit" className="w-[200px] px-6 py-2 bg-[#6A8C73] text-white rounded-lg shadow-md hover:bg-[#3A6953]">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
