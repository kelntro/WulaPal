import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFilter, FiSearch } from "react-icons/fi";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";


const HelpCenter = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [activeTab, setActiveTab] = useState("General");
  const navigate = useNavigate();

  const truncateText = (text, length) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  };

  const faqs = {
    General: [
      {
        question: "How do I manage my notifications?",
        answer:
          "To manage notifications, go to 'Settings,' select 'Notification Settings,' and customize your preferences.",
      },
      {
        question: "How do I start a guided meditation session?",
        answer:
          "Visit the 'Services' tab and select 'Meditation' to start a guided session.",
      },
    ],
    Account: [
      {
        question: "How do I reset my password?",
        answer:
          "Go to 'Account Settings' and select 'Reset Password' to update your credentials.",
      },
    ],
    Payment: [
      {
        question: "How do I add a payment method?",
        answer:
          "Navigate to 'Wallet' and click on 'Add Payment Method' to link your card or e-wallet.",
      },
    ],
    Services: [
      {
        question: "How do I subscribe to a service?",
        answer:
          "Go to the 'Services' tab and choose the plan that suits your needs.",
      },
    ],
  };

  return (
    <div className="p-2 min-h-screen flex flex-col items-start ml-[110px]">
      <div className="w-[calc(100%-0.1rem)] max-w-7xl">
        <h1 className="text-4xl font-bold text-[#285236] mb-2">Help Center</h1>
        <p className="text-[#6A8C73] font-normal mb-6">Here’s your settings for security.</p>
       
        <div className="bg-white shadow-md rounded-lg p-6 w-full flex flex-col">
          {/* Tabs */}
          <div className="flex pb-2 mb-4">
            <h2 
              className="text-xl font-semibold text-[#3A6953] pb-2 mr-6 border-b-2 border-[#285236] cursor-pointer"
              onClick={() => navigate("/help-center")}  // Navigate back to FAQ
            >
              FAQ
            </h2>
            <h2 
              className="text-xl text-gray-400 pb-2 cursor-pointer hover:text-[#3A6953]"
              onClick={() => navigate("/contact-us")}  // Navigate to Contact Us page
            >
              Contact Us
            </h2>
          </div>

          {/* Search Bar and Image */}
          <div className="flex justify-between items-center pb-4 mb-4">
            <div className="flex space-x-4">
              {Object.keys(faqs).map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-2 rounded-full border-2 text-[#3A6953] font-medium transition duration-200 ${
                    activeTab === tab
                      ? "bg-[#99C6A9] text-white border-[#3A6953]"
                      : "bg-white border-[#3A6953]"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative flex items-center border-2 border-[#3A6953] rounded-full px-4 py-2 w-[300px]">
              <FiSearch className="text-[#3A6953] mr-2" />
              <input
                type="text"
                placeholder="Search for help"
                className="bg-transparent outline-none text-[#6A8C73] font-normal flex-grow"
              />
              <FiFilter className="text-[#3A6953]" />
            </div>
          </div>

          {/* Image and FAQ List */}
          <div className="flex justify-between mb-6">
            <div className="w-2/3 space-y-4">
              {faqs[activeTab].map((faq, index) => (
                <div
                  key={index}
                  className="bg-[#D4E8DB] p-4 rounded-2xl cursor-pointer"
                  onClick={() => setActiveQuestion(activeQuestion === index ? null : index)}
                >
                  <div className="flex justify-between items-center font-semibold">
                    <p className="text-[#285236] font-bold">{truncateText(faq.question, 50)}</p>
                    <span className="text-[#285236] font-bold text-xl">
                      {activeQuestion === index ? <HiChevronUp /> : <HiChevronDown />}
                    </span>
                  </div>
                  {activeQuestion === index && (
                    <p className="text-[#6A8C73] font-normal mt-2 p-4 border-t border-[#FFFFFF]">
                      {truncateText(faq.answer, 100)}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="w-1/3 flex justify-end">
              <img src="/assets/FAQ.png" alt="FAQ Illustration" className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;