import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-green-900 text-white h-screen p-4 fixed">
      <h1 className="text-xl font-bold mb-4">WulaPal</h1>
      <ul>
        <li className="mb-2">
          <Link to="/dashboard" className="block px-4 py-2 hover:bg-green-700">Dashboard</Link>
        </li>
        <li className="mb-2">
          <Link to="/analytics" className="block px-4 py-2 hover:bg-green-700">Analytics</Link>
        </li>
        <li className="mb-2">
          <Link to="/manage-group/paluwagan-groups" className="block px-4 py-2 hover:bg-green-700">Groups</Link>
        </li>
        <li className="mb-2">
          <Link to="/wallet" className="block px-4 py-2 hover:bg-green-700">My Wallet</Link>
        </li>
        <li className="mb-2">
          <Link to="/notifications" className="block px-4 py-2 hover:bg-green-700">Notifications</Link>
        </li>
        <li className="mb-2">
          <Link to="/transactions" className="block px-4 py-2 hover:bg-green-700">Transactions</Link>
        </li>
        <li className="mb-2">
          <Link to="/settings" className="block px-4 py-2 hover:bg-green-700">Settings</Link>
        </li>
        <li className="mb-2">
          <Link to="/help-center" className="block px-4 py-2 hover:bg-green-700">Help Center</Link>
        </li>
      </ul>

      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
        <img src="https://via.placeholder.com/40" alt="User Avatar" className="rounded-full w-10 h-10" />
        <div>
          <p className="text-sm font-semibold">Ali Riaz</p>
          <p className="text-xs text-gray-300">Travel Investor</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
