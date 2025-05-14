import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdPayment } from "react-icons/md";
import { BsInfoCircle } from "react-icons/bs";
import { IoIosLock } from "react-icons/io";
import { FaTimes } from "react-icons/fa";

export default function PaymentOption() {
  const navigate = useNavigate();

  const [depositAmount, setDepositAmount] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [depositFee, setDepositFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");

  const handleDepositChange = (e) => {
    const amount = e.target.value;
    // Only allow numbers and decimal point
    if (!/^\d*\.?\d*$/.test(amount)) return;
    setDepositAmount(amount);

    if (!amount) {
      setDepositFee(0);
      setTotal(0);
      return;
    }

    const numericAmount = parseFloat(amount) || 0;
    const fee = numericAmount * 0.00 < 0 ? 0 : numericAmount * 0.00;
    setDepositFee(fee);
    setTotal(numericAmount + fee);
  };

  const handleMobileNumberChange = (e) => {
    const number = e.target.value;
    // Only allow numbers
    if (!/^\d*$/.test(number)) return;
    // Limit to 10 digits (excluding +63)
    if (number.length > 10) return;
    setMobileNumber(number);
  };

  const validateInputs = () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setModalMessage("User ID missing. Please login again.");
      setModalType("error");
      setShowModal(true);
      return false;
    }

    if (!mobileNumber) {
      setModalMessage("Please enter your GCash mobile number.");
      setModalType("error");
      setShowModal(true);
      return false;
    }

    if (mobileNumber.length !== 10) {
      setModalMessage("GCash mobile number must be 10 digits.");
      setModalType("error");
      setShowModal(true);
      return false;
    }

    if (!depositAmount || isNaN(depositAmount) || depositAmount <= 0) {
      setModalMessage("Please enter a valid amount.");
      setModalType("error");
      setShowModal(true);
      return false;
    }

    if (parseFloat(depositAmount) < 10) {
      setModalMessage("Minimum withdrawal amount is ₱10.00");
      setModalType("error");
      setShowModal(true);
      return false;
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5050/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          userId: localStorage.getItem("userId"),
          mobileNumber: mobileNumber,
          channel: "GCASH"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Withdrawal failed");
      }

      // Directly navigate to success page on successful withdrawal
      navigate("/wallet/success-withdraw");
    } catch (error) {
      setModalMessage("Withdrawal failed: " + error.message);
      setModalType("error");
      setShowModal(true);
      console.error("Withdrawal error:", error);
    } finally {
      setLoading(false);
    }
  };

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
            <h3 className="text-[#3A6953] font-medium">Withdraw Funds</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Withdraw funds to your linked GCash account.
          </p>

          <div className="mb-4">
            <label className="text-sm font-medium text-[#3A6953]">Linked Bank</label>
            <div className="border rounded-lg p-3 flex items-center mt-2">
              <img src="/assets/gcashlogo.jpg" alt="Gcash" className="h-[20px] mr-1 ml-[-10px]" />
              <span className="text-gray-700 font-medium">GCash</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-[#3A6953] flex items-center">
              GCash Mobile Number <span className="ml-1 text-gray-400"><BsInfoCircle /></span>
            </label>
            <div className="flex items-center border rounded-md p-2 mt-1">
              <span className="text-gray-700 mr-2">+63</span>
              <input
                type="text"
                className="w-full p-1 outline-none"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={handleMobileNumberChange}
                maxLength={10}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-[#3A6953] flex items-center">
              Amount <span className="ml-1 text-gray-400"><BsInfoCircle /></span>
            </label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md mt-1" 
              placeholder="Enter amount (minimum ₱10.00)" 
              value={depositAmount}
              onChange={handleDepositChange}
            />
          </div>

          <div className="flex space-x-4 mt-[35px]">
            <button 
              className="w-full bg-gray-100 text-[#3A6953] p-2 rounded-md" 
              onClick={() => navigate("/wallet")}
            >
              Cancel
            </button>

            <button
              className="w-full bg-[#3A6953] text-white p-2 rounded-md"
              onClick={handleWithdraw}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Withdrawal"}
            </button>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="flex-1 bg-[#D4E8DB] p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-[#3A6953]">Payment Details</h3>

          <div className="mt-6 text-xl font-medium flex justify-between items-center text-[#3A6953]">
            <span>Withdrawal Amount</span>
            <span className="text-[#3A6953] font-semibold">₱{depositAmount || "0"}</span>
          </div>

          <div className="mt-6 text-xl font-medium flex justify-between items-center text-[#3A6953] border-b border-[#3A6953] pb-4">
            <span>Withdrawal Fee</span>
            <span className="text-[#3A6953] font-semibold">₱{depositFee.toFixed(2)}</span>
          </div>

          <div className="mt-6 text-xl font-semibold flex justify-between items-center text-[#3A6953]">
            <span>Total</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
          
          <div className="mt-[5px] text-gray-500"><IoIosLock /></div> 
          <p className="text-xs text-gray-500 mt-[-16px] ml-6 flex items-center">
            Guaranteed to be safe & secure, ensuring that all transactions are
            protected with the highest level of security.
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
            
            <p className="text-gray-700 mb-6">{modalMessage}</p>
            
            <div className="flex justify-end space-x-4">
              {modalType === "info" && (
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className={`px-4 py-2 rounded-md ${
                  modalType === "error" ? "bg-red-500 hover:bg-red-600" :
                  "bg-[#3A6953] hover:bg-[#2d5342]"
                } text-white`}                
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
