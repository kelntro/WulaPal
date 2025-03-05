import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/global.css";

// Import Pages
import Login from "./pages/Login.jsx";
import Loginn from "./pages/ManageGroup.jsx";
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

        {/* Purchase Routes */}
        <Route path="/purchase/payment-option" element={<PaymentOption />} />
        <Route path="/purchase/subscription" element={<Subscription />} />
        <Route path="/purchase/success" element={<SuccessSubscription />} />
        
        {/* Wallet Routes */}
        <Route path="/wallet/deposit" element={<Deposit />} />
        <Route path="/wallet/success-deposit" element={<SuccessDeposit />} />
        <Route path="/wallet/transfer" element={<Transfer />} />
        <Route path="/wallet/success-transfer" element={<SuccessTransfer />} />
        <Route path="/wallet/withdraw" element={<Withdraw />} />
        <Route path="/wallet/success-withdraw" element={<SuccessWithdraw />} />

        {/* Routes that include Sidebar */}
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
};

export default App;
