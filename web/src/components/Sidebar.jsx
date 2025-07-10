import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
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

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user } = useContext(AuthContext); // ✅ real-time context user

  const isActive = (path) => location.pathname === path;

  // Helper functions for badge
  const getPlanBadgeText = (plan) => {
    if (!plan) return "FREE";
    if (plan.toLowerCase() === "pro") return "PRO";
    if (plan.toLowerCase() === "basic") return "BASIC";
    return plan.toUpperCase();
  };

  const getBadgeStyle = (plan) => {
    switch ((plan || '').toLowerCase()) {
      case 'pro':
        return 'bg-[#89A598] text-white';
      case 'basic':
        return 'bg-[#89A598] text-white';
      default:
        return 'bg-[#89A598] text-white';
    }
  };

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-[#3A6953] text-white h-screen p-4 fixed flex flex-col justify-between transition-all duration-500 ease-out rounded-r-[15px]`}
    >
      {/* Logo & Sidebar Toggle */}
      <div
        className="flex items-center space-x-[-15px] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src="/assets/2.png"
          alt="WulaPal Logo"
          className={`object-cover transition-all duration-300 ${
            isOpen ? "w-[80px] h-[80px]" : "w-[70px] h-[70px]"
          }`}
        />
        {isOpen && (
          <span className="text-white text-2xl font-octosquares font-bold transition-all duration-300">
            ulaPal
          </span>
        )}
      </div>

      {/* Navigation Menu */}
      <ul className="space-y-1 mt-[-100px] flex flex-col">
  {user?.role === "superadmin" ? (
    <>
      <SidebarItem
        to="/dashboard"
        icon={<RxDashboard />}
        label="Dashboard"
        isOpen={isOpen}
        isActive={isActive("/dashboard")}
      />
      <SidebarItem
        to="/wallet"
        icon={<IoWalletOutline />}
        label="My Wallet"
        isOpen={isOpen}
        isActive={isActive("/wallet")}
      />
      <SidebarItem
        to="/transactions"
        icon={<GrTransaction />}
        label="Transactions"
        isOpen={isOpen}
        isActive={isActive("/transactions")}
      />
      <SidebarItem
        to="/settings"
        icon={<IoSettingsSharp />}
        label="Settings"
        isOpen={isOpen}
        isActive={isActive("/settings")}
      />
    </>
  ) : (
    <>
      <SidebarItem
        to="/dashboard"
        icon={<RxDashboard />}
        label="Dashboard"
        isOpen={isOpen}
        isActive={isActive("/dashboard")}
      />
      <SidebarItem
        to="/analytics"
        icon={<IoAnalyticsOutline />}
        label="Analytics"
        isOpen={isOpen}
        isActive={isActive("/analytics")}
      />
      <SidebarItem
        to="/manage-group/paluwagan-groups"
        icon={<MdGroups />}
        label="Groups"
        isOpen={isOpen}
        isActive={isActive("/manage-group/paluwagan-groups")}
      />
      <SidebarItem
        to="/wallet"
        icon={<IoWalletOutline />}
        label="My Wallet"
        isOpen={isOpen}
        isActive={isActive("/wallet")}
      />
      <SidebarItem
        to="/notifications"
        icon={<VscBellDot />}
        label="Notifications"
        isOpen={isOpen}
        isActive={isActive("/notifications")}
      />
      <SidebarItem
        to="/transactions"
        icon={<GrTransaction />}
        label="Transactions"
        isOpen={isOpen}
        isActive={isActive("/transactions")}
      />
      <SidebarItem
        to="/settings"
        icon={<IoSettingsSharp />}
        label="Settings"
        isOpen={isOpen}
        isActive={isActive("/settings")}
      />
      <SidebarItem
        to="/help-center"
        icon={<FaQuestionCircle />}
        label="Help Center"
        isOpen={isOpen}
        isActive={isActive("/help-center")}
      />
      <SidebarItem
        to="/purchase/subscription"
        icon={<MdOutlineSubscriptions />}
        label="Subscriptions"
        isOpen={isOpen}
        isActive={isActive("/purchase/subscription")}
      />
    </>
  )}
</ul>

      {/* User Profile Section */}
      <Link to="/profile/profile-information" className="block">
        <div
          className={`flex items-center p-1 mt-6 mb-3 rounded-lg cursor-pointer transition duration-200 ${
            isActive("/profile/profile-information")
              ? "bg-[#6A8C73]"
              : "hover:bg-[#6A8C73]"
          }`}
        >
          <div className="relative">
            <img
              src={
                user?.profileImage &&
                user.profileImage !== "null" &&
                user.profileImage !== ""
                  ? user.profileImage.startsWith("http")
                    ? user.profileImage
                    : `http://localhost:5050${user.profileImage}`
                  : "/assets/Profile.jpg"
              }
              onError={(e) => {
                console.warn("❌ Failed to load user avatar:", user?.profileImage);
                e.target.onerror = null;
                e.target.src = "/assets/Profile.jpg";
              }}
              referrerPolicy="no-referrer"
              alt="User Avatar"
              className="transition-all object-cover rounded-full w-[40px] h-[40px]"
            />
            {/* Plan Badge */}
            <span className={`absolute left-1/2 -translate-x-1/2 -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow ${getBadgeStyle(user?.plan)}`}
              style={{whiteSpace: 'nowrap'}}>
              {getPlanBadgeText(user?.plan)}
            </span>
          </div>

          {isOpen && (
            <div className="ml-3 flex-1">
              <p className="text-base font-semibold">
                {user?.name || "Organizer"}
              </p>
              <p className="text-xs text-gray-300 capitalize">
                {user?.role || "Organizer"}
              </p>
            </div>
          )}

          {isOpen && <HiChevronRight className="text-gray-300" />}
        </div>
      </Link>
    </div>
  );
};

const SidebarItem = ({ to, icon, label, isOpen, isActive }) => (
  <li>
    <Link
      to={to}
      className={`flex items-center p-[3px] rounded-lg transition duration-200 ${
        isActive ? "bg-[#6A8C73]" : "hover:bg-[#6A8C73] hover:bg-opacity-80"
      }`}
    >
      <div className="flex justify-center items-center w-10 h-10 rounded-lg transition duration-200">
        {icon}
      </div>
      {isOpen && <span className="ml-3">{label}</span>}
    </Link>
  </li>
);

export default Sidebar;
