import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaQuestionCircle } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import {
  IoAnalyticsOutline,
  IoWalletOutline,
  IoSettingsSharp,
} from "react-icons/io5";
import { GrTransaction } from "react-icons/gr";
import { MdGroups, MdOutlineSubscriptions } from "react-icons/md";
import { VscBellDot } from "react-icons/vsc";
import { HiChevronRight } from "react-icons/hi";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Function to check if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-[#3A6953] text-white h-screen p-4 fixed flex flex-col justify-between transition-all duration-500 ease-out rounded-r-[15px]`}
    >
      {/* Logo (Clickable) */}
      <div
        className="flex justify-between items-center mt-1 mb-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src="assets/2.png" 
          alt="WulaPal Logo" 
          className="w-[80px] h-[80px] object-cover"
        />
      </div>

      {/* Navigation Menu */}
      <ul className="space-y-3">
        <li>
          <Link
            to="/dashboard"
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${
              isActive("/dashboard")
                ? "bg-[#6A8C73] border-[#6A8C73]"
                : "hover:bg-[#6A8C73]"
            }`}
          >
            <RxDashboard className="mr-3" /> Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/analytics"
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${
              isActive("/analytics")
                ? "bg-[#6A8C73] border-[#6A8C73]"
                : "hover:bg-[#6A8C73]"
            }`}
          >
            <IoAnalyticsOutline className="mr-3" /> Analytics
          </Link>
        </li>
        <li>
          <Link
            to="/manage-group/paluwagan-groups"
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${
              isActive("/manage-group/paluwagan-groups")
                ? "bg-[#6A8C73] border-[#6A8C73]"
                : "hover:bg-[#6A8C73]"
            }`}
          >
            <MdGroups className="mr-3" /> Paluwagan Groups
          </Link>
        </li>
        <li>
          <Link
            to="/wallet"
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${
              isActive("/wallet")
                ? "bg-[#6A8C73] border-[#6A8C73]"
                : "hover:bg-[#6A8C73]"
            }`}
          >
            <IoWalletOutline className="mr-3" /> My Wallet
          </Link>
        </li>
        <li>
          <Link
            to="/notifications"
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${
              isActive("/notifications")
                ? "bg-[#6A8C73] border-[#6A8C73]"
                : "hover:bg-[#6A8C73]"
            }`}
          >
            <VscBellDot className="mr-3" /> Notifications
          </Link>
        </li>
        <li>
          <Link
            to="/transactions"
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${
              isActive("/transactions")
                ? "bg-[#6A8C73] border-[#6A8C73]"
                : "hover:bg-[#6A8C73]"
            }`}
          >
            <GrTransaction className="mr-3" /> Transactions
          </Link>
        </li>
        <li>
          <Link
            to="/settings"
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${
              isActive("/settings")
                ? "bg-[#6A8C73] border-[#6A8C73]"
                : "hover:bg-[#6A8C73]"
            }`}
          >
            <IoSettingsSharp className="mr-3" /> Settings
          </Link>
        </li>
        <li>
          <Link
            to="/help-center"
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${
              isActive("/help-center")
                ? "bg-[#6A8C73] border-[#6A8C73]"
                : "hover:bg-[#6A8C73]"
            }`}
          >
            <FaQuestionCircle className="mr-3" /> Help Center
          </Link>
        </li>
        <li>
          <Link
            to="/get-plan"
            className={`flex items-center px-4 py-2 rounded-md transition duration-200 
            ${
              isActive("/get-plan")
                ? "bg-[#6A8C73] border-[#6A8C73]"
                : "hover:bg-[#6A8C73]"
            }`}
          >
            <MdOutlineSubscriptions className="mr-3" /> Get Plan
          </Link>
        </li>
      </ul>

      {/* User Profile (Styled to Match the Image) */}
      <Link to="/profile/profile-information" className="block">
        <div className="flex items-center p-3 mt-6 rounded-lg cursor-pointer hover:bg-[#6A8C73] transition duration-200">
          <img
            src="assets/Profile.jpg"
            alt="User Avatar"
            className="rounded-full w-12 h-12"
          />
          <div className="ml-3 flex-1">
            <p className="text-base font-semibold">Ali Riaz</p>
            <p className="text-xs text-gray-300">Travel Handler</p>
          </div>
          <HiChevronRight className="text-gray-300" />
        </div>
      </Link>
    </div>
  );
};

// SidebarItem Component to make the code modular
const SidebarItem = ({ to, icon, label, isOpen, isActive }) => (
  <li>
    <Link
      to={to}
      className={`flex items-center p-[3px] rounded-lg transition duration-200 ${
        isActive ? "bg-[#6A8C73]" : "hover:bg-[#6A8C73] hover:bg-opacity-80"
      }`}
    >
      <div className="flex justify-center items-center w-10 h-10 rounded-lg transition duration-200">{icon}</div>
      {isOpen && <span className="ml-3">{label}</span>}
    </Link>
  </li>
);

export default Sidebar;
