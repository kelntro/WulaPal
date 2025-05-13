import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IoCheckmarkCircle } from "react-icons/io5";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { BsCalendarCheck } from "react-icons/bs";
import logo from "/assets/WulaPal_sidebar.png";
import { AuthContext } from "../../context/AuthContext";

const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const plans = [
    {
      name: "Free",
      price: "₱0",
      groupLimit: "1 Active Group",
      description: "Ideal for trying out WulaPal.",
      features: [
        "Create up to 1 Active Paluwagan Group",
        "Basic Group Management",
        "Access to Basic Features",
      ],
      buttonText: user?.plan === "Free" ? "Your Plan" : "Free",
      disabled: true,
      expirationDate: user?.plan === "Free" ? user?.planExpirationDate : null
    },
    {
      name: "Basic",
      price: "₱300 (One-Time)",
      groupLimit: "Up to 5 Active Groups",
      description: "Perfect for small organizers.",
      features: [
        "Create up to 5 Active Paluwagan Groups",
        "Enhanced Group Management",
        "Priority in Customer Support",
      ],
      buttonText: user?.plan === "Basic" ? "Your Plan" : "Upgrade to Basic",
      disabled: user?.plan === "Basic",
      expirationDate: user?.plan === "Basic" ? user?.planExpirationDate : null
    },
    {
      name: "Pro",
      price: "₱500 (One-Time)",
      groupLimit: "Unlimited Active Groups",
      description: "Best for growing your community.",
      features: [
        "Create Unlimited Active Paluwagan Groups",
        "Advanced Group Management",
        "Priority Support + Future Features",
      ],
      buttonText: user?.plan === "Pro" ? "Your Plan" : "Upgrade to Pro",
      disabled: user?.plan === "Pro",
      expirationDate: user?.plan === "Pro" ? user?.planExpirationDate : null
    },
  ];

  const handleGetStarted = (plan) => {
    if (!plan.disabled) {
      navigate("/purchase/payment-option", { state: { plan } });
    }
  };

  return (
    <div className="relative flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 bg-[#3A6953] text-white px-6 py-2 rounded-lg"
      >
        Go Back
      </button>

      <h1 className="mt-[60px] text-4xl font-bold text-green-900 text-center">
        Upgrade Your Paluwagan Journey
      </h1>
      <p className="text-gray-600 text-center mt-2">
        Unlock more group creation power — one-time payment, lifetime upgrade.
      </p>

      {/* Current Plan Status */}
      {user?.plan && user?.plan !== "Free" && (
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md w-full max-w-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#3A6953]">Current Plan: {user.plan}</h3>
              {user.planExpirationDate && (
                <p className="text-sm text-[#6A8C73] mt-1">
                  <BsCalendarCheck className="inline mr-2" />
                  Expires on {formatDate(user.planExpirationDate)}
                </p>
              )}
            </div>
            <div className="bg-[#3A6953] text-white px-4 py-2 rounded-lg">
              Active
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="p-6 rounded-lg border border-[#E4E4E4] text-left text-[#3A6953] flex flex-col justify-between min-h-[350px] bg-white"
          >
            <div>
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <p className="text-3xl font-semibold mt-2 text-[#3A6953]">{plan.price}</p>
              <p className="mt-2 text-sm text-[#6A8C73]">{plan.description}</p>
              <p className="mt-2 text-md font-semibold">{plan.groupLimit}</p>
              {plan.expirationDate && (
                <div className="mt-2 flex items-center text-sm text-[#6A8C73]">
                  <BsCalendarCheck className="mr-2" />
                  <span>Expires: {formatDate(plan.expirationDate)}</span>
                </div>
              )}
              <ul className="mt-4 text-sm text-[#6A8C73] flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <IoCheckmarkCircle /> {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              disabled={plan.disabled}
              className={`mt-6 px-6 py-2 w-full rounded-lg font-semibold border ${
                plan.disabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 text-[#3A6953] border-[#3A6953] hover:bg-[#3A6953] hover:text-white transition"
              }`}
              onClick={() => handleGetStarted(plan)}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="w-full mt-[50px] p-[30px] flex items-center justify-between px-[60px] bg-[#3A6953]">
        <img src={logo} alt="WulaPal Logo" className="h-[50px]" />
        <div className="flex gap-2">
          <a href="https://www.instagram.com/wulapal.system1/" className="text-[#3A6953] bg-white p-2 rounded-full shadow-md hover:opacity-80 transition">
            <FaInstagram size={16} />
          </a>
          <a href="https://www.facebook.com/profile.php?id=61575890444891" className="text-[#3A6953] bg-white p-2 rounded-full shadow-md hover:opacity-80 transition">
            <FaFacebookF size={16} />
          </a>
          <a href="https://www.linkedin.com/in/wulapal-system-830479365/" className="text-[#3A6953] bg-white p-2 rounded-full shadow-md hover:opacity-80 transition">
            <FaLinkedinIn size={16} />
          </a>
          <a href="https://x.com/wulapalsystem" className="text-[#3A6953] bg-white p-2 rounded-full shadow-md hover:opacity-80 transition">
            <FaTwitter size={16} />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Subscription;
