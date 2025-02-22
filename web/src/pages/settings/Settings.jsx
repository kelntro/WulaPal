import React from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { HiChevronRight } from "react-icons/hi";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="p-2 min-h-screen flex flex-col items-start ml-[90px]">
      <div className="w-[calc(100%-0.1rem)] max-w-7xl">
        <h1 className="text-4xl font-bold text-[#285236] mb-2">Settings</h1>
        <p className="text-[#6A8C73] font-normal mb-6">Here’s your settings for security.</p>
        
        <div className="rounded-2xl p-6 w-full flex flex-col space-y-4">
          <button 
            className="bg-[#FFFFFF] hover:bg-[#285236] hover:bg-opacity-20 text-[#285236] font-medium py-4 px-6 rounded-2xl text-left flex justify-between items-center shadow-md"
            onClick={() => navigate("/change-password")}
          >
            Change Password
            <HiChevronRight className="text-[#285236] opacity-60 text-xl" />
          </button>
          <button 
            className="bg-[#FFFFFF] hover:bg-[#6A8C73] hover:bg-opacity-20 text-[#285236] font-medium py-4 px-6 rounded-2xl text-left flex justify-between items-center shadow-md"
            onClick={() => navigate("/terms-and-conditions")}
          >
            Terms and Condition
            <HiChevronRight className="text-[#285236] opacity-60 text-xl" />
          </button>
          <button 
            className="bg-[#FFFFFF] hover:bg-[#6A8C73] hover:bg-opacity-20 text-[#285236] font-medium py-4 px-6 rounded-2xl text-left flex justify-between items-center shadow-md"
            onClick={() => navigate("/privacy-policy")}
          >
            Privacy Policy
            <HiChevronRight className="text-[#285236] opacity-60 text-xl" />
          </button>
          
          <button 
            className="bg-[#6A8C73] hover:bg-[#285236] text-white font-medium py-4 px-6 rounded-2xl flex items-center justify-between"
            onClick={() => navigate("/logout")}
          >
            Log out
            <FiLogOut className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;