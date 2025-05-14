import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [verificationClicked, setVerificationClicked] = useState(false);

  const handleSignup = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Invalid email address.");
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters, including uppercase, lowercase, and numbers."
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms and Conditions.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5050/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "organizer" }), // Ensure only organizers register
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid server response. Please check backend.");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setSuccess(
        "Organizer account created successfully! Check your email for the verification link."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setSuccess(null);
    setResendDisabled(true);

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

      setSuccess("Verification email resent. Check your inbox.");
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setResendDisabled(false);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message);
      setResendDisabled(false);
    }
  };

  const handleVerificationClick = () => {
    setVerificationClicked(true);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAgreeTerms(false);
    setResendDisabled(false);
    setCountdown(60);
  };

  return (
    <div className="bg-gray-100 flex justify-center items-center min-h-screen px-4">
      <div className="w-full max-w-[1000px] flex flex-row bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left Section - Signup Form */}
        <div className="w-3/5 flex flex-col justify-center p-12">
          <h2 className="text-3xl font-bold text-green-900 mb-6">
            Let’s Get Started
          </h2>

          {/* Success Message */}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-gray-500 text-sm font-semibold mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                const newName = e.target.value;
                const nameRegex = /^[a-zA-Z\s]*$/; // Allows only letters and spaces
                if (nameRegex.test(newName) && newName.length <= 50) {
                  setName(newName); // Update state only if valid
                }
              }}
              className="w-full px-2 pb-2 border-b border-gray-300 focus:border-[#3A6953] focus:outline-none text-gray-700 text-lg"
              required
            />
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <label className="block text-gray-500 text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update email state
              onBlur={() => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation regex
                if (email && !emailRegex.test(email)) {
                  setError("Please enter a valid email address."); // Show feedback only if invalid
                } else {
                  setError(null); // Clear error if valid
                }
              }}
              maxLength={50} // Set maximum of 50 characters
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
                onBlur={() => {
                  if (!passwordRegex.test(password)) {
                    alert(
                      "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, and one number."
                    );
                  }
                }}
                maxLength={30} // Enforce max length of 30 characters
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

          {/* Confirm Password Input */}
          <div className="mb-6">
            <label className="block text-gray-500 text-sm font-semibold mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => {
                  if (confirmPassword !== password) {
                    alert("Passwords do not match.");
                  }
                }}
                maxLength={30} // Enforce max length of 30 characters
                className="w-full px-2 pb-2 border-b border-gray-300 focus:border-[#3A6953] focus:outline-none text-gray-700 text-lg"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">
              I agree with the{" "}
              <a
                href="#"
                className="text-green-700 font-semibold hover:underline"
              >
                Terms and Conditions
              </a>
            </span>
          </div>

          {/* Signup Button */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className={`w-full bg-[#3A6953] text-white py-3 rounded-lg text-lg font-semibold transition ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#2F5442]"
            }`}
          >
            {loading ? "Signing up..." : "Create Account"}
          </button>

          {/* Resend Verification Email */}
          {success && !verificationClicked && (
            <button
              onClick={handleResendVerification}
              disabled={resendDisabled}
              className="mt-4 text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              {resendDisabled
                ? `Resend in ${countdown}s...`
                : "Resend Verification Email"}
            </button>
          )}

          {/* Already have an account? Login */}
          <p className="mt-6 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-700 font-semibold hover:underline"
              onClick={handleVerificationClick}
            >
              Login
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

export default Signup;
