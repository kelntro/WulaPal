import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/global.css";

// Import Pages
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import PaymentOption from "./pages/purchase/Payment-option.jsx";
import Subscription from "./pages/purchase/Subscription.jsx";
import SuccessSubscription from "./pages/purchase/Success-subscription.jsx";


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
        <Route path="/purchase/payment-option" element={<PaymentOption />} />
        <Route path="/purchase/subscription" element={<Subscription />} />
        <Route path="/purchase/success" element={<SuccessSubscription />} />
        

        {/* Routes that include Sidebar */}
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
};

export default App;
