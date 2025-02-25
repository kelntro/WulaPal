import React, { useState, useEffect } from "react";
import { AiOutlineCheckCircle } from "react-icons/ai";

const ProcessingTransaction = () => {
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 3000); // Change to success page after 3 seconds

    return () => clearTimeout(timer);
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
          <p className="text-lg text-gray-700 text-center mb-4 mb-[20px] mt-[-50px]">
            We are processing the payment for you, hold on!
          </p>
          
          {/* Circular Loading Spinner with Smooth Gradient Fade */}
          <div className="w-16 h-16 rounded-full animate-spin mb-[120px]"
               style={{
                 borderWidth: '10px',
                 borderStyle: 'solid',
                 borderColor: 'transparent',
                 borderTopColor: 'rgba(34, 139, 34, 0)',
                 borderRightColor: 'rgba(34, 139, 34, 0.2)',
                 borderBottomColor: 'rgba(34, 139, 34, 0.4)',
                 borderLeftColor: 'rgba(34, 139, 34, 1)',
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
            You had successfully purchased a starter plan on WulaPal, Thank you for purchasing with us!
          </p>
          
          {/* Success Icon */}
          <AiOutlineCheckCircle className="w-[80px] h-[80px] text-green-700 mb-[130px]" /> 
          
          {/* Back to Dashboard Link */}
          <a href="/dashboard" className="mt-4 text-[#7C87AA] hover:underline">Back to <span className="font-semibold text-[#3A6953]">Dashboard</span></a>
        </div>
      )}
    </div>
  );
};

export default ProcessingTransaction;
