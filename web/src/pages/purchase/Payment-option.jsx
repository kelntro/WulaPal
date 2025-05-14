import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdPayment } from "react-icons/md";
import { BsInfoCircle } from "react-icons/bs";
import { IoIosLock } from "react-icons/io";
import { FaTimes } from "react-icons/fa";

export default function PaymentOption() {
  const navigate = useNavigate();
  const location = useLocation();
  const planFromSubscription = location.state?.plan?.name || "Basic";

  const [selectedPlan, setSelectedPlan] = useState(planFromSubscription);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error"); // error, success, info

  const plans = {
    Basic: 300,
    Pro: 500,
  };

  useEffect(() => {
    const fetchBalance = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?._id;

      if (!userId) {
        setModalMessage("User ID missing. Please login again.");
        setModalType("error");
        setShowModal(true);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5050/api/wallet/balance?userId=${userId}`);
        const data = await res.json();
        setBalance(data.balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setModalMessage("Failed to fetch balance. Please try again.");
        setModalType("error");
        setShowModal(true);
      }
    };

    fetchBalance();
  }, []);

  const handleConfirmPayment = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?._id;

    if (!userId) {
      setModalMessage("User ID missing. Please login again.");
      setModalType("error");
      setShowModal(true);
      return;
    }

    // Check if user has sufficient balance
    if (balance < plans[selectedPlan]) {
      setModalMessage(
        `Insufficient balance. You need ₱${plans[selectedPlan]}.00 but have ₱${balance}.00. Please deposit more funds to proceed.`
      );
      setModalType("error");
      setShowModal(true);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5050/api/purchase/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plans[selectedPlan],
          plan: selectedPlan,
          userId,
          successRedirectURL: `http://localhost:5173/purchase/success?plan=${selectedPlan}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checkout_url) {
          localStorage.setItem("selectedPlan", selectedPlan);
          window.location.href = data.checkout_url;
        } else {
          throw new Error("Checkout URL missing.");
        }
      } else {
        const errorText = await res.text();
        console.error("Payment API Error:", errorText);
        throw new Error("Payment initiation failed.");
      }
    } catch (error) {
      setModalMessage("Payment failed: " + error.message);
      setModalType("error");
      setShowModal(true);
      console.error("Payment error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalAction = () => {
    setShowModal(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-50 p-6">
      <div className="flex flex-col lg:flex-row bg-white shadow-lg rounded-2xl p-6 w-[1000px] h-[600px] max-w-full">
        {/* Payment Form */}
        <div className="flex-1 pr-8">
          <div className="flex items-center mb-4">
            <img
              src="/assets/4.png"
              alt="WulaPal"
              className="h-[50px] mr-2 ml-[-70px]"
            />
          </div>
          <div className="flex items-center mb-4">
            <span className="text-green-700 text-xl mr-2">
              <MdPayment />
            </span>
            <h3 className="text-[#3A6953] font-medium">
              Payment for {selectedPlan} Plan on WulaPal.
            </h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Please, enter your details to confirm the purchase.
          </p>

          <div className="mb-4">
            <label className="text-sm font-medium text-[#3A6953]">
              Powered by
            </label>
            <div className="border rounded-lg p-3 flex items-center mt-2">
              <img
                src="/assets/xendit-logo.png"
                alt="Xendit"
                className="h-[20px] mr-2 ml-[-10px]"
              />
              <span className="text-gray-700 font-medium">
                Xendit Payment Gateway
              </span>
            </div>
          </div>

          <div className="flex space-x-4 mt-[110px]">
            <button
              className="w-full bg-gray-100 text-[#3A6953] p-2 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => navigate("/purchase/subscription")}
            >
              Cancel
            </button>

            <button
              className="w-full bg-[#3A6953] text-white p-2 rounded-md hover:bg-[#2d5342] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConfirmPayment}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </div>

        {/* Plan Details */}
        <div className="flex-1 bg-[#D4E8DB] p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-[#3A6953]">
            Choose Your Plan
          </h3>
          <div className="space-y-4">
            {Object.keys(plans).map((planKey) => (
              <div
                key={planKey}
                className={`p-4 border border-[#3A6953] rounded-lg flex justify-between items-center cursor-pointer transition-colors ${
                  selectedPlan === planKey ? "bg-white" : "hover:bg-white/50"
                }`}
                onClick={() => setSelectedPlan(planKey)}
              >
                <label className="cursor-pointer flex items-center space-x-2 text-[#3A6953]">
                  <input
                    type="radio"
                    name="plan"
                    value={planKey}
                    className="form-radio"
                    checked={selectedPlan === planKey}
                    readOnly
                  />
                  <span>{planKey} Plan</span>
                </label>
                <span className="text-[#3A6953]">₱{plans[planKey]}.00</span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-xl font-semibold flex justify-between items-center text-[#3A6953]">
            <span>Total</span>
            <span>₱{plans[selectedPlan]}.00</span>
          </div>

          <div className="mt-4 text-sm text-[#3A6953]">
            <span>Your Balance: ₱{balance}.00</span>
          </div>

          <div className="mt-[5px] text-gray-500">
            <IoIosLock />
          </div>
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
              <button
                onClick={handleModalAction}
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
