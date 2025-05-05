import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Layout from "./Layout";

// Import Pages
import Analytics from "../pages/analytics/Analytics.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import HelpCenter from "../pages/help-center/Help-center.jsx";
import ContactUs from "../pages/help-center/Contact-us";
import CreateGroupModal from "../pages/manage-group/CreateGroupModal.jsx";
import AddMember from "../pages/manage-group/AddMemberModal.jsx";
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
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const noSidebarRoutes = ["/", "/login", "/signup"];
  const shouldShowSidebar = !noSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex">
      {shouldShowSidebar && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}

      <div
        className={`flex-1 transition-all duration-500 ${
          shouldShowSidebar ? (isSidebarOpen ? "ml-[200px]" : "ml-[20px]") : "ml-0"
        } p-0`}
      >
        <Routes>
          <Route element={<Layout />}>
            {/* Shared route */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile/profile-information" element={<ProfileInformation />} />

            {/* Organizer-only routes */}
            {user?.role !== "superadmin" && (
              <>
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/manage-group/create" element={<CreateGroupModal />} />
                <Route path="/manage-group/add-member" element={<AddMember />} />
                <Route path="/manage-group/chat/:groupId" element={<GroupChat />} />
                <Route path="/manage-group/members" element={<GroupMembers />} />
                <Route path="/manage-group/transactions/:groupId" element={<GroupTransactions />} />
                <Route path="/manage-group/paluwagan-groups" element={<PaluwaganGroups />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/terms-and-conditions" element={<TermsandConditions />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              </>
            )}
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default MainLayout;
