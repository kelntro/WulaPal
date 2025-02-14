import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="bg-gray-100 flex justify-center items-center min-h-screen px-4">
      <div className="w-full max-w-[1000px] flex flex-row bg-white shadow-lg rounded-lg overflow-hidden">
        
        {/* Left Section - Signup Form */}
        <div className="w-3/5 flex flex-col justify-center p-12">
          <h2 className="text-3xl font-bold text-green-900 mb-6">
            Let’s Get Started
          </h2>

          {/* Email Input */}
          <div className="mb-6">
            <label className="block text-gray-500 text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder=""
              className="w-full px-2 pb-2 border-b border-gray-300 focus:border-[#3A6953] focus:outline-none text-gray-700 text-lg"
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
                placeholder=""
                className="w-full px-2 pb-2 border-b border-gray-300 focus:border-[#3A6953] focus:outline-none text-gray-700 text-lg"
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
                placeholder=""
                className="w-full px-2 pb-2 border-b border-gray-300 focus:border-[#3A6953] focus:outline-none text-gray-700 text-lg"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-center mb-6">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm text-gray-600">
              I agree with the {" "}
              <a href="#" className="text-green-700 font-semibold hover:underline">
                Terms and Conditions
              </a>
            </span>
          </div>

          {/* Signup Button */}
          <button className="w-full bg-[#3A6953] text-white py-3 rounded-lg text-lg font-semibold hover:bg-[#2F5442] transition">
            Create Account
          </button>

          {/* OR Section */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">Or sign up with</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Google Sign-In Button */}
          <button className="w-full flex items-center justify-center border py-3 rounded-lg hover:bg-gray-100 transition">
            <FcGoogle className="mr-2" size={22} /> Sign up with Google
          </button>

          {/* Already have an account? Login */}
          <p className="mt-6 text-sm text-gray-600 text-center">
            Already have an account? {" "}
            <Link to="/login" className="text-green-700 font-semibold hover:underline">
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
