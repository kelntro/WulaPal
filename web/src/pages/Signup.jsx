import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-lg flex overflow-hidden">
        
        {/* Left Section - Signup Form */}
        <div className="w-1/2 px-16 py-16 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-green-900 mb-8">
            Let’s Get Started
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
          <div className="mb-4 relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mb-4 relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-center mb-6">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm text-gray-600">
              I agree with the{" "}
              <a href="#" className="text-green-700 font-semibold hover:underline">
                Terms and Conditions
              </a>
            </span>
          </div>

          {/* Signup Button */}
          <button className="w-full bg-green-700 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition">
            Create Account
          </button>

          {/* OR Section */}
          <div className="flex items-center my-6">
            <div className="w-full h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">Or sign up with</span>
            <div className="w-full h-px bg-gray-300"></div>
          </div>

          {/* Google Sign-In Button */}
          <button className="w-full flex items-center justify-center border py-3 rounded-lg hover:bg-gray-100 transition">
            <FcGoogle className="mr-2" size={22} /> Sign up with Google
          </button>

          {/* Already have an account? Login */}
          <p className="mt-6 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-green-700 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>

        {/* Right Section - Image */}
        <div className="w-1/2 h-full">
          <img
            src="/assets/login-image.png"
            alt="Signup Illustration"
            className="w-full h-full object-cover rounded-r-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
