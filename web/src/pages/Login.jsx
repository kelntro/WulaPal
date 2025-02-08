import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = () => {
    // Add authentication logic here (if needed)
    navigate("/dashboard"); // Navigate to Dashboard
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-lg flex overflow-hidden">
        
        {/* Left Section - Login Form */}
        <div className="w-1/2 px-16 py-16 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-green-900 mb-8">
            Welcome Back, Ka-Wula!
          </h2>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Password Input */}
          <div className="mb-6 relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin} // Attach handleLogin function
            className="w-full bg-green-700 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition"
          >
            Login
          </button>

          {/* OR Section */}
          <div className="flex items-center my-6">
            <div className="w-full h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">Or sign up with</span>
            <div className="w-full h-px bg-gray-300"></div>
          </div>

          {/* Google Sign-In Button */}
          <button className="w-full flex items-center justify-center border py-3 rounded-lg hover:bg-gray-100 transition">
            <FcGoogle className="mr-2" size={22} /> Sign in with Google
          </button>

          {/* Sign Up Link */}
          <p className="mt-6 text-sm text-gray-600 text-center">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-green-700 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Right Section - Image */}
        <div className="w-1/2 h-full">
          <img
            src="/assets/login-image.png"
            alt="Login Illustration"
            className="w-full h-full object-cover rounded-r-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
