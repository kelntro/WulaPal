import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/global.css";

// Import Pages
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Analytics from "./pages/analytics/Analytics.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import HelpCenter from "./pages/help-center/Help-center.jsx";
import ContactUs from "./pages/help-center/Contact-us";
import CreateGroup from "./pages/manage-group/Create-group.jsx";
import GroupChat from "./pages/manage-group/Group-chat.jsx";
import GroupMembers from "./pages/manage-group/Group-members.jsx";
import GroupTransactions from "./pages/manage-group/Group-transactions.jsx";
import PaluwaganGroups from "./pages/manage-group/Paluwagan-groups.jsx";
import Notifications from "./pages/notifications/Notifications.jsx";
import PaymentOption from "./pages/purchase/Payment-option.jsx";
import Subscription from "./pages/purchase/Subscription.jsx";
import SuccessSubscription from "./pages/purchase/Success-subscription.jsx";
import Settings from "./pages/settings/Settings.jsx";
import Transactions from "./pages/transactions/Transactions.jsx";
import Wallet from "./pages/wallet/Wulapal.jsx";
import ProfileInformation from "./pages/profile/Profile-information.jsx";

// Import Main Layout Component
import MainLayout from "./components/MainLayout";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Routes (No Sidebar) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Routes that include Sidebar */}
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
};

export default App;
