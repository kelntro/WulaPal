import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { MdPayment } from "react-icons/md";
import { BsInfoCircle } from "react-icons/bs";
import { IoIosLock } from "react-icons/io";

export default function PaymentOption() {
  const navigate = useNavigate();

  const [depositAmount, setDepositAmount] = useState("");
  const [depositFee, setDepositFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [recipientId, setRecipientId] = useState(""); // <-- new
  const [loading, setLoading] = useState(false);

  const handleDepositChange = (e) => {
    const amount = e.target.value;
    setDepositAmount(amount);

    if (!amount) {
      setDepositFee(0);
      setTotal(0);
      return;
    }

    const numericAmount = parseFloat(amount) || 0;
    const fee = numericAmount * 0.02 < 5 ? 5 : numericAmount * 0.02;
    setDepositFee(fee);
    setTotal(numericAmount + fee);
  };

  const handleTransfer = async () => {
    const senderId = localStorage.getItem("userId");
    if (!senderId) return alert("User ID missing. Please login again.");
    if (!recipientId || recipientId === senderId) return alert("Enter a valid recipient ID.");
    if (!depositAmount || isNaN(depositAmount) || depositAmount <= 0) return alert("Enter a valid amount.");

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5050/api/wallet/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId,
          recipientId,
          amount: parseFloat(depositAmount),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Transfer failed.");

      navigate("/wallet/success-transfer");
    } catch (err) {
      alert("Transfer failed: " + err.message);
      console.error("Transfer error:", err);
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
            <h3 className="text-[#3A6953] font-medium">Transfer Fund</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Transfer Funds to Other WulaPal Wallet.
          </p>

          <div className="mb-4">
            <label className="text-sm font-medium text-[#3A6953] flex items-center">
              Recipient ID <span className="ml-1 text-gray-400"><BsInfoCircle /></span>
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-md mt-1"
              placeholder="Enter recipient userId"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-[#3A6953] flex items-center">
              Amount <span className="ml-1 text-gray-400"><BsInfoCircle /></span>
            </label>
            <input 
              type="number" 
              className="w-full p-2 border rounded-md mt-1" 
              placeholder="Enter amount" 
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
              onClick={handleTransfer}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Transfer"}
            </button>
          </div>
        </div>

        {/* Plan Details */}
        <div className="flex-1 bg-[#D4E8DB] p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-[#3A6953]">Payment Details</h3>

          <div className="mt-6 text-xl font-medium flex justify-between items-center text-[#3A6953]">
            <span>Transfer Amount</span>
            <span className="text-[#3A6953] font-semibold">₱{depositAmount || "0"}</span>
          </div>

          <div className="mt-6 text-xl font-medium flex justify-between items-center text-[#3A6953] border-b border-[#3A6953] pb-4">
            <span>Transfer Fee</span>
            <span className="text-[#3A6953] font-semibold">₱{depositAmount ? depositFee.toFixed(2) : "0"}</span>
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
    </div>
  );
}
