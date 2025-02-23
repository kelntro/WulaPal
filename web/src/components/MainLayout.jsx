import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Layout from "./Layout";

// Import Pages
import Analytics from "../pages/analytics/Analytics.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import HelpCenter from "../pages/help-center/Help-center.jsx";
import ContactUs from "../pages/help-center/Contact-us";
import CreateGroup from "../pages/manage-group/Create-group.jsx";
import GroupChat from "../pages/manage-group/Group-chat.jsx";
import GroupMembers from "../pages/manage-group/Group-members.jsx";
import GroupTransactions from "../pages/manage-group/Group-transactions.jsx";
import PaluwaganGroups from "../pages/manage-group/Paluwagan-groups.jsx";
import Notifications from "../pages/notifications/Notifications.jsx";
import Settings from "../pages/settings/Settings.jsx";
import TermsandConditions from "../pages/settings/Terms-and-conditions.jsx";
import PrivacyPolicy from "../pages/settings/Privacy-policy.jsx";
import Transactions from "../pages/transactions/Transactions.jsx";
import Wallet from "../pages/wallet/Wulapal.jsx";
import ProfileInformation from "../pages/profile/Profile-information.jsx";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation(); // Get current route

  // Define routes where Sidebar should NOT be displayed
  const noSidebarRoutes = ["/", "/login", "/signup"];
  const shouldShowSidebar = !noSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex">
      {/* Conditionally render Sidebar */}
      {shouldShowSidebar && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-500 ${
          shouldShowSidebar ? (isSidebarOpen ? "ml-[200px]" : "ml-[20px]") : "ml-0"
        } p-0`}
      >
        <Routes>
          {/* Routes with Sidebar Wrapped in Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />

            {/* Help Center Routes */}
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/contact-us" element={<ContactUs />} />

            {/* Manage Group Routes */}
            <Route path="/manage-group/create" element={<CreateGroup />} />
            <Route path="/manage-group/chat" element={<GroupChat />} />
            <Route path="/manage-group/members" element={<GroupMembers />} />
            <Route path="/manage-group/transactions" element={<GroupTransactions />} />
            <Route path="/manage-group/paluwagan-groups" element={<PaluwaganGroups />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/terms-and-conditions" element={<TermsandConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />


            {/* Other Routes */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/wallet" element={<Wallet />} />

            {/* User Profile */}
            <Route path="/profile/profile-information" element={<ProfileInformation />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default MainLayout;
