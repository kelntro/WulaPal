import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { MdPayment } from "react-icons/md";
import { BsInfoCircle } from "react-icons/bs";
import { IoIosLock } from "react-icons/io";

export default function PaymentOption() {
  const [total, setTotal] = useState(16);
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const navigate = useNavigate(); // Initialize navigate function

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-50 p-6">
      <div className="flex flex-col lg:flex-row bg-white shadow-lg rounded-2xl p-6 w-[1000px] h-[600px] max-w-full">
        {/* Payment Form */}
        <div className="flex-1 pr-8">
          <div className="flex items-center mb-4">
            <img src="/assets/4.png" alt="WulaPal" className="h-[50px] mr-2 ml-[-70px]" />
          </div>
          <div className="flex items-center mb-4">
            <span className="text-green-700 text-xl mr-2"><MdPayment /></span>
            <h3 className="text-[#3A6953] font-medium">Payment for Starter Plan on WulaPal.</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Please, enter your details to confirm the purchase.
          </p>

          <div className="mb-4">
            <label className="text-sm font-medium text-[#3A6953]">Bank Payment</label>
            <div className="border rounded-lg p-3 flex items-center mt-2">
              <img src="/assets/gcashlogo.jpg" alt="Gcash" className="h-[20px] mr-1 ml-[-10px]" />
              <span className="text-gray-700 font-medium">Gcash</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-[#3A6953] flex items-center">
              Account Name <span className="ml-1 text-gray-400"><BsInfoCircle /></span>
            </label>
            <input type="text" className="w-full p-2 border rounded-md mt-1" placeholder="Enter account name" />
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-[#3A6953] flex items-center">
              Account Number <span className="ml-1 text-gray-400"><BsInfoCircle /></span>
            </label>
            <div className="flex items-center border rounded-md p-2 mt-1">
              <span className="text-gray-700 mr-2">+63</span>
              <input type="text" className="w-full p-1 outline-none" placeholder="- - - -  - - - -  - - - -" />
            </div>
          </div>

          <div className="flex space-x-4 mt-[110px]">
            {/* Cancel Button - Navigate back to Subscription */}
            <button 
              className="w-full bg-gray-100 text-[#3A6953] p-2 rounded-md" 
              onClick={() => navigate("/purchase/subscription")}
            >
              Cancel
            </button>

            <button className="w-full bg-[#3A6953] text-white p-2 rounded-md"
                    onClick={() => navigate("/purchase/success")}>Confirm Payment</button>
          </div>
        </div>

        {/* Plan Details */}
        <div className="flex-1 bg-[#D4E8DB] p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-[#3A6953]">Basic Plan</h3>
          <div className="space-y-4">
            <div 
              className={`p-4 border border-[#3A6953] rounded-lg flex justify-between items-center ${selectedPlan === "monthly" ? "bg-white" : ""}`}
              onClick={() => { setTotal(300); setSelectedPlan("monthly"); }}
            >
              <label className="cursor-pointer flex items-center space-x-2 text-[#3A6953]">
                <input type="radio" name="plan" value="monthly" className="form-radio" checked={selectedPlan === "monthly"} readOnly />
                <span>Pay Monthly</span>
              </label>
              <span className="text-[#3A6953]">₱300 / Month / Member</span>
            </div>
            
            <div 
              className={`p-4 border border-[#3A6953] rounded-lg flex justify-between items-center ${selectedPlan === "annual" ? "bg-white" : ""}`}
              onClick={() => { setTotal(250); setSelectedPlan("annual"); }}
            >
              <label className="cursor-pointer flex items-center space-x-2">
                <input type="radio" name="plan" value="annual" className="form-radio" checked={selectedPlan === "annual"} readOnly />
                <span className="text-[#3A6953]">Pay Annual</span>
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-[#3A6953]">₱250 / Month / Member</span>
                <span className="bg-[#3A6953] text-white px-2 py-1 rounded text-xs">Save 15%</span>
              </div>
            </div>
          </div>
          <div className="mt-6 text-xl font-semibold flex justify-between items-center text-[#3A6953]">
            <span>Total</span>
            <span>₱{total}.00</span>
          </div>
          <div className="mt-[5px] text-gray-500"><IoIosLock /></div> 
          <p className="text-xs text-gray-500 mt-[-16px] ml-6 flex items-center">
           Guaranteed to be safe & secure, ensuring that all transactions are
            protected with the highest level of security.
          </p>
        </div>
      </div>
    </div>
  );
}
