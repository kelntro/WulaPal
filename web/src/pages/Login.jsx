import { useState } from "react"; 
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
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null); // Clear previous errors
    setLoading(true); // Disable button while processing

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "organizer" }), // Ensure only organizers log in
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user.role !== "organizer") {
        throw new Error("Only organizers can log in here.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

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
            <Link to="/signup" className="text-green-700 font-semibold hover:underline">
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
