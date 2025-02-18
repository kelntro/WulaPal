import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaQuestionCircle } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { IoAnalyticsOutline, IoWalletOutline, IoSettingsSharp } from "react-icons/io5";
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
      <ul className="space-y-1 mt-[-100px] flex flex-col">
        <SidebarItem to="/dashboard" icon={<RxDashboard />} label="Dashboard" isOpen={isOpen} isActive={isActive("/dashboard")} />
        <SidebarItem to="/analytics" icon={<IoAnalyticsOutline />} label="Analytics" isOpen={isOpen} isActive={isActive("/analytics")} />
        <SidebarItem to="/manage-group/paluwagan-groups" icon={<MdGroups />} label="Groups" isOpen={isOpen} isActive={isActive("/manage-group/paluwagan-groups")} />
        <SidebarItem to="/wallet" icon={<IoWalletOutline />} label="My Wallet" isOpen={isOpen} isActive={isActive("/wallet")} />
        <SidebarItem to="/notifications" icon={<VscBellDot />} label="Notifications" isOpen={isOpen} isActive={isActive("/notifications")} />
        <SidebarItem to="/transactions" icon={<GrTransaction />} label="Transactions" isOpen={isOpen} isActive={isActive("/transactions")} />
        <SidebarItem to="/settings" icon={<IoSettingsSharp />} label="Settings" isOpen={isOpen} isActive={isActive("/settings")} />
        <SidebarItem to="/help-center" icon={<FaQuestionCircle />} label="Help Center" isOpen={isOpen} isActive={isActive("/help-center")} />
        <SidebarItem to="/get-plan" icon={<MdOutlineSubscriptions />} label="Subscriptions" isOpen={isOpen} isActive={isActive("/get-plan")} />
      </ul>

      {/* User Profile (Improved Sizing and Roundness) */}
      <div className="flex items-center p-1 mt-6 mb-3 rounded-lg cursor-pointer hover:bg-[#6A8C73] transition duration-200">
        <img
          src="assets/Profile.jpg"
          alt="User Avatar"
          className={`transition-all object-cover rounded-full ${
            isOpen ? "w-[40px] h-[40px]" : "w-[40px] h-[40px] object-cover"
          }`}
        />
        {isOpen && (
          <div className="ml-3 flex-1">
            <p className="text-base font-semibold">Ali Riaz</p>
            <p className="text-xs text-gray-300">Travel Handler</p>
          </div>
        )}
        {isOpen && <HiChevronRight className="text-gray-300" />}
      </div>
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
