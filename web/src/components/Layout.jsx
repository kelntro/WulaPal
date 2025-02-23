import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom"; // Allows rendering of child components

const Layout = () => {
  return (
    <div className="flex">     
      <div className="min-h-screen h-full w-full p-6 bg-[#D4E8DB]">
        
        {/* Your Page Content Here */}
        <Outlet /> {/* This will render the page content */}
      </div>
    </div>
  );
};

export default Layout;
