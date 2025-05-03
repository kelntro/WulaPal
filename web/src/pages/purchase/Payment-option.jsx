import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdPayment } from "react-icons/md";
import { BsInfoCircle } from "react-icons/bs";
import { IoIosLock } from "react-icons/io";

export default function PaymentOption() {
  const navigate = useNavigate();
  const location = useLocation();
  const planFromSubscription = location.state?.plan?.name || "Basic";

  const [selectedPlan, setSelectedPlan] = useState(planFromSubscription);
  const [loading, setLoading] = useState(false);

  const plans = {
    Basic: 300,
    Pro: 500,
  };

  const handleConfirmPayment = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?._id;

    if (!userId) {
      alert("User ID missing. Please login again.");
      return;
    }

    if (!userId) {
      alert("User ID missing. Please login again.");
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
          successRedirectURL: "http://localhost:5173/purchase/success", // << 🔥 important: Xendit will go here after payment
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checkout_url) {
          localStorage.setItem("selectedPlan", selectedPlan);
          window.location.href = data.checkout_url; // Redirect to Xendit Checkout
        } else {
          throw new Error("Checkout URL missing.");
        }
      } else {
        const errorText = await res.text();
        console.error("Payment API Error:", errorText);
        throw new Error("Payment initiation failed.");
      }
    } catch (error) {
      alert("Payment failed: " + error.message);
      console.error("Payment error:", error.message);
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
              className="w-full bg-gray-100 text-[#3A6953] p-2 rounded-md"
              onClick={() => navigate("/purchase/subscription")}
            >
              Cancel
            </button>

            <button
              className="w-full bg-[#3A6953] text-white p-2 rounded-md"
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
                className={`p-4 border border-[#3A6953] rounded-lg flex justify-between items-center ${
                  selectedPlan === planKey ? "bg-white" : ""
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

          <div className="mt-[5px] text-gray-500">
            <IoIosLock />
          </div>
          <p className="text-xs text-gray-500 mt-[-16px] ml-6 flex items-center">
            Guaranteed to be safe & secure, ensuring that all transactions are
            protected with the highest level of security.
          </p>
        </div>
      </div>
    </div>
  );
}
