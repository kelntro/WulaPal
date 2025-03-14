import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (resendDisabled) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendDisabled]);

  const handleLogin = async () => {
    setError(null);
    setResendMessage(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "organizer" }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // If OTP has been sent, navigate to OTP verification page
      if (data.otpSent) {
        navigate("/otp", { state: { email } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setResendMessage(null);
    setResendDisabled(true);
    setCountdown(60);

    if (!email) {
      setError("Please enter your email before resending verification.");
      setResendDisabled(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5050/api/auth/resend-verification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email.");
      }

      setResendMessage("Verification email resent. Check your inbox.");
    } catch (err) {
      setError(err.message);
      setResendDisabled(false);
    }
  };

  return (
    <div className="bg-gray-100 flex justify-center items-center min-h-screen px-4">
      <div className="w-full max-w-[1000px] flex flex-row bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left Section - Login Form */}
        <div className="w-3/5 flex flex-col justify-center p-12">
          <h2 className="text-3xl font-bold text-green-900 mb-6">
            Welcome Back, Ka-Wula!
          </h2>

          {/* Email Input */}
          <div className="mb-6">
            <label className="block text-gray-500 text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2 pb-2 border-b border-gray-300 focus:border-[#3A6953] focus:outline-none text-gray-700 text-lg"
              required
            />
          </div>

          {/* Password Input with Toggle */}
          <div className="mb-6">
            <label className="block text-gray-500 text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-2 pb-2 border-b border-gray-300 focus:border-[#3A6953] focus:outline-none text-gray-700 text-lg"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full bg-[#3A6953] text-white py-3 rounded-lg text-lg font-semibold transition ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#2F5442]"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Error Message */}
          {error && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-red-500 text-sm mb-4">{error}</p>

              {/* Show Resend Verification Button if the error is related to verification */}
              {error.includes("verify your email") && (
                <button
                  onClick={handleResendVerification}
                  disabled={resendDisabled}
                  className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                >
                  {resendDisabled
                    ? `Resend in ${countdown}s...`
                    : "Resend Verification Email"}
                </button>
              )}
            </div>
          )}

          {resendMessage && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-green-500 text-sm mb-4">{resendMessage}</p>
            </div>
          )}

          {/* OR Section */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">Or sign up with</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Google Sign-In Button */}
          <button className="w-full flex items-center justify-center border py-3 rounded-lg hover:bg-gray-100 transition">
            <FcGoogle className="mr-2" size={22} /> Sign in with Google
          </button>

          {/* Sign Up Link */}
          <p className="mt-6 text-sm text-gray-600 text-center">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-green-700 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Right Section - Image with Overlay */}
        <div className="w-1/2 h-auto relative">
          <img
            src="assets/Final_login.png"
            alt="Login Illustration"
            className="w-full h-full object-cover"
          />
          {/* Green Overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-green-800 opacity-10"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
