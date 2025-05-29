import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { MdPayment } from "react-icons/md";
import { BsInfoCircle } from "react-icons/bs";
import { IoIosLock } from "react-icons/io";
import { FaTimes } from "react-icons/fa";

export default function PaymentOption() {
  const navigate = useNavigate();

  const [depositAmount, setDepositAmount] = useState("");
  const [depositFee, setDepositFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [recipientId, setRecipientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");
  const [checkingRecipient, setCheckingRecipient] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [transferDetails, setTransferDetails] = useState(null);

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

  const handleRecipientIdChange = (e) => {
    const id = e.target.value;
    // Only allow alphanumeric characters
    if (!/^[a-zA-Z0-9]*$/.test(id)) return;
    setRecipientId(id);
  };

  const checkRecipientExists = async (recipientId) => {
    try {
      const res = await fetch(`http://localhost:5050/api/users/check/${recipientId}`);
      if (!res.ok) {
        throw new Error('Failed to check recipient');
      }
      const data = await res.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking recipient:", error);
      setModalMessage("Error checking recipient. Please try again.");
      setModalType("error");
      setShowModal(true);
      return false;
    }
  };

  const validateInputs = async () => {
    const senderId = localStorage.getItem("userId");

    if (!senderId) {
      setModalMessage("User ID missing. Please login again.");
      setModalType("error");
      setShowModal(true);
      return false;
    }

    if (!recipientId) {
      setModalMessage("Please enter recipient ID.");
      setModalType("error");
      setShowModal(true);
      return false;
    }

    if (recipientId === senderId) {
      setModalMessage("You cannot transfer to yourself.");
      setModalType("error");
      setShowModal(true);
      return false;
    }

    // Check if recipient exists
    setCheckingRecipient(true);
    const recipientExists = await checkRecipientExists(recipientId);
    setCheckingRecipient(false);

    if (!recipientExists) {
      setModalMessage("Recipient user ID not found. Please check and try again.");
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
      setModalMessage("Minimum transfer amount is ₱10.00");
      setModalType("error");
      setShowModal(true);
      return false;
    }

    return true;
  };

  const handleTransfer = async () => {
    if (!(await validateInputs())) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5050/api/wallet/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: localStorage.getItem("userId"),
          recipientId,
          amount: parseFloat(depositAmount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Transfer failed.");
      }

      // Set transfer details for receipt
      setTransferDetails({
        amount: parseFloat(depositAmount),
        recipientId,
        timestamp: new Date().toISOString(),
        referenceId: data.referenceId || `transfer-${Date.now()}`
      });

      setModalMessage("Transfer successful!");
      setModalType("success");
      setShowModal(true);
      
      // Show receipt after a short delay
      setTimeout(() => {
        setShowModal(false);
        setShowReceipt(true);
      }, 1500);

    } catch (err) {
      setModalMessage("Transfer failed: " + err.message);
      setModalType("error");
      setShowModal(true);
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
            <div className="relative">
              <input
                type="text"
                className="w-full p-2 border rounded-md mt-1"
                placeholder="Enter recipient userId"
                value={recipientId}
                onChange={handleRecipientIdChange}
                disabled={checkingRecipient}
              />
              {checkingRecipient && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3A6953]"></div>
                </div>
              )}
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

      {/* Receipt Modal */}
      {showReceipt && transferDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => {
                setShowReceipt(false);
                navigate("/wallet");
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
            
            <div className="text-center mb-6">
              <div className="text-2xl text-[#3A6953] font-bold mb-2">Transfer Receipt</div>
              <div className="text-sm text-gray-500">Transaction Successful</div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600">Amount</span>
                <span className="text-[#3A6953] font-semibold">₱{transferDetails.amount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600">Recipient ID</span>
                <span className="text-[#3A6953] font-semibold">{transferDetails.recipientId}</span>
              </div>

              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600">Date & Time</span>
                <span className="text-[#3A6953] font-semibold">
                  {new Date(transferDetails.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600">Reference ID</span>
                <span className="text-[#3A6953] font-semibold text-sm">
                  {transferDetails.referenceId}
                </span>
              </div>

              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600">Status</span>
                <span className="text-green-600 font-semibold">Completed</span>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowReceipt(false);
                  navigate("/wallet");
                }}
                className="bg-[#3A6953] text-white px-6 py-2 rounded-md hover:bg-[#2d5342] transition-colors"
              >
                Done
              </button>
            </div>

            <div className="mt-6 text-center">
              <div className="text-gray-500 text-sm flex items-center justify-center">
                <IoIosLock className="mr-1" />
                Secure Transaction
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
            
            <div className={`text-2xl mb-4 ${
              modalType === "error" ? "text-red-600" :
              modalType === "success" ? "text-[#3A6953]" :
              "text-[#3A6953]"
            }`}>
              {modalType === "error" ? "⚠️ Error" :
               modalType === "success" ? "✅ Success" :
               "⚠️ Information"}
            </div>
            
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
