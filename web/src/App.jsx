import { React, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/global.css";

import RequireAuth from "./components/RequireAuth";
import { useAuth } from "./context/AuthContext";
import LoadingScreen from "./components/LoadingScreen"; // ⬅️ create this or replace with your loader

// Import Pages
import Login from "./pages/Login.jsx";
import OtpVerification from "./pages/OtpVerification.jsx";
import GroupMembers from "./pages/manage-group/Group-members.jsx";
import JoinRequests from "./pages/group/JoinRequests.jsx";
import Signup from "./pages/Signup.jsx";
import PaymentOption from "./pages/purchase/Payment-option.jsx";
import Subscription from "./pages/purchase/Subscription.jsx";
import SuccessSubscription from "./pages/purchase/Success-subscription.jsx";
import Deposit from "./pages/wallet/Deposit.jsx";
import SuccessDeposit from "./pages/wallet/Success-deposit.jsx";
import Transfer from "./pages/wallet/Transfer.jsx";
import SuccessTransfer from "./pages/wallet/Success-transfer.jsx";
import Withdraw from "./pages/wallet/Withdraw.jsx";
import SuccessWithdraw from "./pages/wallet/Success-withdraw.jsx";
import ChangePassword from "./pages/settings/ChangePassword.jsx";
import GroupChatList from "./pages/group/GroupChatList";
import GroupChat from "./pages/manage-group/Group-chat";
import SearchResults from "./pages/SearchResults";
import UserProfile from "./pages/UserProfile";
import MessageUser from "./pages/MessageUser";
import MainLayout from "./components/MainLayout";

const App = () => {
  const { user } = useAuth();
  useEffect(() => {
    if (!user?._id || user.role !== "organizer") return;

    const interval = setInterval(() => {
      fetch(`http://localhost:5050/api/users/last-active/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }).catch((err) =>
        console.warn("⚠️ Failed to update lastActive (web):", err.message)
      );
    }, 120000); // every 2 minutes

    return () => clearInterval(interval);
  }, [user?._id, user?.role]);
  
  if (user === undefined) return <LoadingScreen />; // 🛑 Wait for hydration

  return (
    <Router>
      <Routes>
        {/* Auth Routes (No Protection) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<OtpVerification />} />

        {/* Purchase Routes */}
        <Route path="/purchase/payment-option" element={<RequireAuth><PaymentOption /></RequireAuth>} />
        <Route path="/purchase/subscription" element={<RequireAuth><Subscription /></RequireAuth>} />
        <Route path="/purchase/success" element={<RequireAuth><SuccessSubscription /></RequireAuth>} />

        {/* Wallet Routes */}
        <Route path="/wallet/deposit" element={<RequireAuth><Deposit /></RequireAuth>} />
        <Route path="/wallet/success-deposit" element={<RequireAuth><SuccessDeposit /></RequireAuth>} />
        <Route path="/wallet/transfer" element={<RequireAuth><Transfer /></RequireAuth>} />
        <Route path="/wallet/success-transfer" element={<RequireAuth><SuccessTransfer /></RequireAuth>} />
        <Route path="/wallet/withdraw" element={<RequireAuth><Withdraw /></RequireAuth>} />
        <Route path="/wallet/success-withdraw" element={<RequireAuth><SuccessWithdraw /></RequireAuth>} />

        <Route path="/group/join-requests" element={<RequireAuth><JoinRequests /></RequireAuth>} />

        <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
        <Route path="/groupchats" element={<RequireAuth><GroupChatList /></RequireAuth>} />
        <Route path="/groupchat/:groupId" element={<RequireAuth><GroupChat /></RequireAuth>} />
        <Route path="/group-members/:groupId" element={<RequireAuth><GroupMembers /></RequireAuth>} />
        <Route path="/search" element={<RequireAuth><SearchResults /></RequireAuth>} />
        <Route path="/user/:userId" element={<RequireAuth><UserProfile /></RequireAuth>} />
        <Route path="/message/:userId" element={<RequireAuth><MessageUser /></RequireAuth>} />

        {/* MainLayout includes dashboard and more */}
        <Route path="/*" element={<RequireAuth><MainLayout /></RequireAuth>} />
      </Routes>
    </Router>
  );
};

export default App;
