import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/global.css"; 

// Import Pages
import Home from "./pages/Home.jsx";
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
import Layout from "./components/Layout.jsx";  // Import Layout
import ProfileInformation from "./pages/profile/Profile-information.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Routes (No Sidebar) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Routes with Sidebar */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />

          {/* Help Center Routes */}
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/contact-us" element={<ContactUs />} />

          <Route path="/manage-group/create" element={<CreateGroup />} />
          <Route path="/manage-group/chat" element={<GroupChat />} />
          <Route path="/manage-group/members" element={<GroupMembers />} />
          <Route path="/manage-group/transactions" element={<GroupTransactions />} />
          <Route path="/manage-group/paluwagan-groups" element={<PaluwaganGroups />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/purchase/payment-option" element={<PaymentOption />} />
          <Route path="/purchase/subscription" element={<Subscription />} />
          <Route path="/purchase/success" element={<SuccessSubscription />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/wallet" element={<Wallet />} />

          {/* User Profile */}
          <Route path="/profile/profile-information" element={<ProfileInformation />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
