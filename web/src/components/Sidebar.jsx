import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaQuestionCircle } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { IoAnalyticsOutline, IoWalletOutline, IoSettingsSharp } from "react-icons/io5";
import { GrTransaction } from "react-icons/gr";
import { MdGroups, MdOutlineSubscriptions } from "react-icons/md";
import { VscBellDot } from "react-icons/vsc";
import { HiChevronRight } from "react-icons/hi2";

const Sidebar = () => {
  const location = useLocation();

  // Function to check if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-[#3A6953] text-white h-screen p-4 fixed flex flex-col justify-between rounded-r-[15px]">
      
      {/* Logo (Perfectly Positioned) */}
      <div className="flex justify-center items-center mt-6 mb-1">
        <img 
          src="assets/WulaPal_sidebar.png" 
          alt="WulaPal Logo" 
          className="fixed w-[200px] h-[60px] top-8 left-5 object-cover"
        />
      </div>

      {/* Navigation Menu */}
      <ul className="space-y-3">
        <li>
          <Link 
            to="/dashboard" 
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${isActive("/dashboard") ? "bg-[#6A8C73] border-[#6A8C73]" : "hover:bg-[#6A8C73]"}`}
          >
            <RxDashboard className="mr-3" /> Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/analytics" 
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${isActive("/analytics") ? "bg-[#6A8C73] border-[#6A8C73]" : "hover:bg-[#6A8C73]"}`}
          >
            <IoAnalyticsOutline className="mr-3" /> Analytics
          </Link>
        </li>
        <li>
          <Link 
            to="/manage-group/paluwagan-groups" 
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${isActive("/manage-group/paluwagan-groups") ? "bg-[#6A8C73] border-[#6A8C73]" : "hover:bg-[#6A8C73]"}`}
          >
            <MdGroups className="mr-3" /> Paluwagan Groups
          </Link>
        </li>
        <li>
          <Link 
            to="/wallet" 
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${isActive("/wallet") ? "bg-[#6A8C73] border-[#6A8C73]" : "hover:bg-[#6A8C73]"}`}
          >
            <IoWalletOutline className="mr-3" /> My Wallet
          </Link>
        </li>
        <li>
          <Link 
            to="/notifications" 
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${isActive("/notifications") ? "bg-[#6A8C73] border-[#6A8C73]" : "hover:bg-[#6A8C73]"}`}
          >
            <VscBellDot className="mr-3" /> Notifications
          </Link>
        </li>
        <li>
          <Link 
            to="/transactions" 
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${isActive("/transactions") ? "bg-[#6A8C73] border-[#6A8C73]" : "hover:bg-[#6A8C73]"}`}
          >
            <GrTransaction className="mr-3" /> Transactions
          </Link>
        </li>
        <li>
          <Link 
            to="/settings" 
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${isActive("/settings") ? "bg-[#6A8C73] border-[#6A8C73]" : "hover:bg-[#6A8C73]"}`}
          >
            <IoSettingsSharp className="mr-3" /> Settings
          </Link>
        </li>
        <li>
          <Link 
            to="/help-center" 
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${isActive("/help-center") ? "bg-[#6A8C73] border-[#6A8C73]" : "hover:bg-[#6A8C73]"}`}
          >
            <FaQuestionCircle className="mr-3" /> Help Center
          </Link>
        </li>
        <li>
          <Link 
            to="/get-plan" 
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${isActive("/get-plan") ? "bg-[#6A8C73] border-[#6A8C73]" : "hover:bg-[#6A8C73]"}`}
          >
            <MdOutlineSubscriptions className="mr-3" /> Get Plan
          </Link>
        </li>
      </ul>

      {/* User Profile (Styled to Match the Image) */}
      <div className="flex items-center p-3 mt-6 rounded-lg cursor-pointer hover:bg-[#6A8C73] transition duration-200">
        <img src="assets/Profile.jpg" alt="User Avatar" className="rounded-full w-12 h-12" />
        <div className="ml-3 flex-1">
          <p className="text-base font-semibold">Ali Riaz</p>
          <p className="text-xs text-gray-300">Travel Handler</p>
        </div>
        <HiChevronRight className="text-gray-300" />
      </div>

    </div>
  );
};

export default Sidebar;





