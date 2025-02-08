import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom"; // Allows rendering of child components

const Layout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-green-100">
        <Outlet /> {/* This will render the page content */}
      </div>
    </div>
  );
};

export default Layout;
