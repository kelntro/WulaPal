import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OtpVerification = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email || "";
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResendDisabled, setOtpResendDisabled] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(60);

  useEffect(() => {
    let timer;
    if (otpResendDisabled) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setOtpResendDisabled(false);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpResendDisabled]);

  const handleVerifyOTP = async () => {
    setOtpError(null);
    setOtpLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5050/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed");
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user._id);
      navigate("/dashboard");
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpError(null);
    setOtpResendDisabled(true);
    setOtpCountdown(60);
    try {
      const response = await fetch(
        "http://localhost:5050/api/auth/resend-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP.");
      }
    } catch (err) {
      setOtpError(err.message);
      setOtpResendDisabled(false);
    }
  };

  return (
    <div className="bg-gray-100 flex justify-center items-center min-h-screen px-4">
      <div className="w-full max-w-[1000px] flex flex-row bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left Section - OTP Verification Form */}
        <div className="w-3/5 flex flex-col justify-center p-12">
          <h2 className="text-3xl font-bold text-green-900 mb-6">
            OTP Verification
          </h2>
          <p className="mb-4 text-gray-600">
            An OTP has been sent to {email}. Please enter it below.
          </p>
          <div className="mb-6">
            <label className="block text-gray-500 text-sm font-semibold mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 6) {
                  setOtp(value);
                }
              }}
              className="w-full px-2 pb-2 border-b border-gray-300 focus:border-[#3A6953] focus:outline-none text-gray-700 text-lg"
              required
            />
          </div>
          <button
            onClick={handleVerifyOTP}
            disabled={otpLoading}
            className={`w-full bg-[#3A6953] text-white py-3 rounded-lg text-lg font-semibold transition ${
              otpLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#2F5442]"
            }`}
          >
            {otpLoading ? "Verifying..." : "Verify OTP"}
          </button>
          {otpError && (
            <div className="flex flex-col items-center justify-center mt-4">
              <p className="text-red-500 text-sm mb-2">{otpError}</p>
            </div>
          )}
          <div className="flex flex-col items-center justify-center mt-4">
            <button
              onClick={handleResendOTP}
              disabled={otpResendDisabled}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              {otpResendDisabled
                ? `Resend in ${otpCountdown}s...`
                : "Resend OTP"}
            </button>
          </div>
        </div>

        {/* Right Section - Image with Overlay */}
        <div className="w-1/2 h-auto relative">
          <img
            src="assets/Final_login.png"
            alt="OTP Verification Illustration"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-green-800 opacity-10"></div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
