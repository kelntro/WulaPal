import React, { useState, useEffect } from "react";
import { AiOutlineCheckCircle } from "react-icons/ai";

const ProcessingTransaction = () => {
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const savePlan = async () => {
      const userId = localStorage.getItem("userId");
      const selectedPlan = localStorage.getItem("selectedPlan");

      if (!userId || !selectedPlan) {
        console.error("Missing userId or selectedPlan in localStorage.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5050/api/users/update-plan", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, plan: selectedPlan }),
        });

        if (!response.ok) throw new Error("Failed to update plan.");
      } catch (err) {
        console.error("❌ Failed to save plan:", err.message);
      } finally {
        setTimeout(() => setIsProcessing(false), 1500); // Wait a bit after API call
      }
    };

    savePlan();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-green-50 p-6">
      {isProcessing ? (
        <div className="flex flex-col items-center bg-white shadow-lg rounded-2xl p-6 w-[1000px] h-[600px] max-w-full">
          {/* Logo */}
          <div className="mb-2 mt-[-30px]">
            <img src="/assets/1.png" alt="Logo" className="w-[300px] h-[300px]" />
          </div>

          {/* Text */}
          <p className="text-lg text-gray-700 text-center mb-[20px] mt-[-50px]">
            We are processing the payment for you, hold on!
          </p>

          {/* Circular Loading Spinner */}
          <div
            className="w-16 h-16 rounded-full animate-spin mb-[120px]"
            style={{
              borderWidth: "10px",
              borderStyle: "solid",
              borderColor: "transparent",
              borderTopColor: "rgba(34, 139, 34, 0)",
              borderRightColor: "rgba(34, 139, 34, 0.2)",
              borderBottomColor: "rgba(34, 139, 34, 0.4)",
              borderLeftColor: "rgba(34, 139, 34, 1)",
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center bg-white shadow-lg rounded-2xl p-6 w-[1000px] h-[600px] max-w-full">
          {/* Logo */}
          <div className="mb-2 mt-[-30px]">
            <img src="/assets/1.png" alt="Logo" className="w-[300px] h-[300px]" />
          </div>

          {/* Success Message */}
          <p className="text-lg text-gray-700 text-center mb-[10px] mt-[-50px]">
            You had successfully purchased a starter plan on WulaPal. Thank you for purchasing with us!
          </p>

          {/* Success Icon */}
          <AiOutlineCheckCircle className="w-[80px] h-[80px] text-green-700 mb-[130px]" />

          {/* Back to Dashboard Link */}
          <a href="/dashboard" className="mt-4 text-[#7C87AA] hover:underline">
            Back to <span className="font-semibold text-[#3A6953]">Dashboard</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default ProcessingTransaction;
