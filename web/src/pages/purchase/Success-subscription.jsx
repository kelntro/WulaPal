import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const SuccessSubscription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext);
  const [isProcessing, setIsProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savePlan = async () => {
      try {
        const storedUser = user || JSON.parse(localStorage.getItem("user"));
        const fallbackUserId = localStorage.getItem("selectedPlanUserId"); // from PaymentOption
        const urlParams = new URLSearchParams(window.location.search);
        const selectedPlan = location.state?.plan || urlParams.get("plan") || localStorage.getItem("selectedPlan");
    
        if (!storedUser || !storedUser._id) {
          console.error("❌ No valid stored user found");
          throw new Error("User not found or not logged in");
        }
    
        if (!selectedPlan) {
          console.error("❌ No plan selected from URL, state, or localStorage");
          throw new Error("No plan selected");
        }
    
        const userId = fallbackUserId || storedUser._id;
    
        if (!userId) {
          console.error("❌ No valid userId to send in request");
          throw new Error("Missing user ID for plan update");
        }
    
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    
        const planUpdatePayload = {
          userId,
          plan: selectedPlan,
          planExpirationDate: expirationDate.toISOString(),
        };
    
        console.log("📤 Sending plan update to server:", planUpdatePayload);
    
        const response = await fetch("http://localhost:5050/api/users/update-plan", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(planUpdatePayload),
        });
    
        const data = await response.json();
    
        console.log("📥 Server response:", data);
    
        if (!response.ok) {
          console.warn("⚠️ Plan update failed with status", response.status);
          throw new Error(data.message || "Failed to update plan");
        }
    
        if (data.success) {
          const updatedUser = {
            ...storedUser,
            plan: selectedPlan,
            planExpirationDate: expirationDate.toISOString(),
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          localStorage.removeItem("selectedPlan");
          localStorage.removeItem("selectedPlanUserId");
          setUser(updatedUser);
          setSuccess(true);
          
          await fetch("http://localhost:5050/api/purchase/credit-superadmin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fromUserId: userId,
              amount: selectedPlan === "Basic" ? 300 : 500,
            }),
          });
          
          console.log("✅ Plan updated and user context refreshed");
        }
      } catch (err) {
        console.error("❌ Failed to save plan:", err.message);
        setError(err.message);
      } finally {
        setTimeout(() => setIsProcessing(false), 1500);
      }
    };    

    savePlan();
  }, [location.state, setUser]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6953] mx-auto"></div>
          <p className="mt-4 text-[#3A6953]">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/purchase/subscription")}
            className="bg-[#3A6953] text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-[#3A6953] mb-4">Subscription Successful!</h1>
          <p className="text-gray-600 mb-8">Your plan has been upgraded successfully.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#3A6953] text-white px-6 py-2 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default SuccessSubscription;
