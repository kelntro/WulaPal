import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFilter, FiSearch } from "react-icons/fi";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

const HelpCenter = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [activeTab, setActiveTab] = useState("General");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, questions, answers
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const navigate = useNavigate();

  const faqs = {
    General: [
      {
        question: "What is WulaPal?",
        answer:
          "WulaPal is a blockchain-powered digital Paluwagan platform that allows users to join or manage rotating savings groups with automated contributions and payouts.",
      },
      {
        question: "Is WulaPal secure?",
        answer:
          "Yes. WulaPal uses smart contracts on the Polygon network to ensure transparency, security, and automation of group contributions and payouts.",
      },
      {
        question: "Can I use WulaPal without a crypto wallet?",
        answer:
          "Yes. WulaPal handles blockchain transactions behind the scenes so users don’t need to manage their own crypto wallets or MATIC tokens.",
      },
    ],
    Account: [
      {
        question: "How do I update my profile information?",
        answer:
          "Go to the 'Profile' section, click 'Edit,' and update your personal details. Required fields must be completed before accessing full app features.",
      },
      {
        question: "Can I use my Google account to sign in?",
        answer:
          "Yes. WulaPal supports Google Sign-In for quick and secure access. Simply choose 'Sign in with Google' on the login screen and select your Google account to continue.",
      },
      {
        question: "Why do I need to upload an ID?",
        answer:
          "Uploading a valid government ID helps verify your identity for compliance and fraud prevention. It is required before joining savings groups and creating groups as an organizer.",
      },
    ],
    Payments: [
      {
        question: "How do I deposit money into my WulaPal wallet?",
        answer:
          "Go to 'Wallet' > 'Deposit' and select your preferred payment method (e.g., GCash, card via Xendit). Follow the instructions to complete your deposit.",
      },
      {
        question: "How do I withdraw my earnings?",
        answer:
          "Navigate to 'Wallet' > 'Withdraw' and enter your GCash or bank account details. Withdrawals are processed via Xendit.",
      },
      {
        question: "Are there any transaction fees?",
        answer:
          "Yes. A minimal transaction fee in PHP is charged to cover blockchain and processing costs. It will be displayed before confirming any transaction.",
      },
    ],
    Groups: [
      {
        question: "How do I create a group as an organizer?",
        answer:
          "As an organizer, go to the 'Groups' tab in your dashboard and click 'Create a Paluwagan.' Fill out the required details like group name, contribution amount, frequency and maximum members. Once submitted, your group will be visible to potential members who can request to join.",
      },
      {
        question: "How are payouts scheduled?",
        answer:
          "Payouts are automatically triggered after all initial security deposit for the cycle are received. Each member gets one scheduled payout turn per group.",
      },
      {
        question: "How do I decline a member's join request?",
        answer:
          "To decline a join request, go to the 'Paluwagan Groups' page and click 'View Join Requests.' From the list of pending requests, click the 'Decline' button beside the member you wish to reject. This helps keep your group limited to trusted members.",
      },
      {
        question: "How do I accept a member's join request?",
        answer:
          "Go to the 'Paluwagan Groups' page and click the 'View Join Requests' button. You’ll see a list of pending requests. To accept a member, click the 'Approve' button next to their name. Once approved, the member will be prompted to proceed with their security deposit before officially joining the group.",
      },
      {
        question: "How is the payout order determined in a group?",
        answer:
          "The payout order is based on the amount of each member's security deposit. Members who deposit a higher amount are prioritized to receive payouts earlier. If two or more members deposit the same amount, the one who submitted the deposit first will receive the payout first.",
      },
    ],
    Technical: [
      {
        question: "Why is a user's profile marked incomplete?",
        answer:
          "As an organizer, you can only approve members with fully completed profiles. A profile is marked incomplete if required fields like name, date of birth, ID type and image, occupation, source of funds, and full address are missing.",
      },
      {
        question: "Why can't I upload my group image or logo?",
        answer:
          "Make sure the image file is in JPG or PNG format and under 5MB. If the upload fails, try renaming the file and uploading again. Also, ensure your internet connection is stable.",
      },
      {
        question: "Why isn't the group I just created showing in my dashboard?",
        answer:
          "After creating a group, refresh your dashboard. If it's still not showing, double-check that the creation was successful and there were no validation errors.",
      },
      {
        question: "Why can't I approve a member's join request?",
        answer:
          "You can only approve join requests if your group is not yet full and the member's profile is complete.",
      },
      {
        question: "Why is the contribution or payout not triggering for my group?",
        answer:
          "Ensure the group has enough active members and all contributions are received. If the issue persists, contact support to check if the backend scheduler is working.",
      },
    ],
  };

  const filteredFaqs = faqs[activeTab].filter((faq) => {
    const query = searchQuery.trim().toLowerCase();
    if (filterType === "questions") return faq.question.toLowerCase().includes(query);
    if (filterType === "answers") return faq.answer.toLowerCase().includes(query);
    return (faq.question + " " + faq.answer).toLowerCase().includes(query);
  });

  return (
    <div className="p-2 min-h-screen flex flex-col items-start ml-[110px]">
      <div className="w-[calc(100%-0.1rem)] max-w-7xl">
        <h1 className="text-4xl font-bold text-[#285236] mb-2">Help Center</h1>
        <p className="text-[#6A8C73] font-normal mb-6">
          Here’s your guide for using WulaPal.
        </p>

        <div className="bg-white shadow-md rounded-lg p-6 w-full flex flex-col">
          {/* Tabs */}
          <div className="flex pb-2 mb-4">
            <h2
              className="text-xl font-semibold text-[#3A6953] pb-2 mr-6 border-b-2 border-[#285236] cursor-pointer"
              onClick={() => navigate("/help-center")}
            >
              FAQ
            </h2>
            <h2
              className="text-xl text-gray-400 pb-2 cursor-pointer hover:text-[#3A6953]"
              onClick={() => navigate("/contact-us")}
            >
              Contact Us
            </h2>
          </div>

          {/* Search and Filter */}
          <div className="flex justify-between items-center pb-4 mb-4">
            <div className="flex space-x-4">
              {Object.keys(faqs).map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-2 rounded-full border border-[#3A6953] text-[#3A6953] font-medium transition duration-200 ${
                    activeTab === tab
                      ? "bg-[#99C6A9] text-white"
                      : "bg-white"
                  }`}
                  onClick={() => {
                    setActiveTab(tab);
                    setActiveQuestion(null);
                    setSearchQuery("");
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative flex items-center border border-[#3A6953] rounded-full px-4 py-2 w-[300px]">
              <FiSearch className="text-[#3A6953] mr-2" />
              <input
                type="text"
                placeholder="Search for help"
                className="bg-transparent outline-none text-[#6A8C73] font-normal flex-grow"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="relative">
                <FiFilter
                  className="text-[#3A6953] cursor-pointer"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                />
                {showFilterDropdown && (
                  <div className="absolute right-0 top-8 bg-white border rounded shadow-md z-10">
                    <button
                      className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setFilterType("all");
                        setShowFilterDropdown(false);
                      }}
                    >
                      All
                    </button>
                    <button
                      className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setFilterType("questions");
                        setShowFilterDropdown(false);
                      }}
                    >
                      Questions Only
                    </button>
                    <button
                      className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setFilterType("answers");
                        setShowFilterDropdown(false);
                      }}
                    >
                      Answers Only
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FAQ List */}
          <div className="flex justify-between mb-6">
            <div className="w-2/3 space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-[#D4E8DB] p-4 rounded-2xl cursor-pointer"
                    onClick={() =>
                      setActiveQuestion(activeQuestion === index ? null : index)
                    }
                  >
                    <div className="flex justify-between items-center font-semibold">
                      <p className="text-[#285236] font-bold">{faq.question}</p>
                      <span className="text-[#285236] font-bold text-xl">
                        {activeQuestion === index ? <HiChevronUp /> : <HiChevronDown />}
                      </span>
                    </div>
                    {activeQuestion === index && (
                      <p className="text-[#6A8C73] font-normal mt-2 p-4 border-t border-[#FFFFFF]">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No matching FAQs found.</p>
              )}
            </div>

            {/* Right Side Image */}
            <div className="w-1/3 flex justify-end">
              <img
                src="/assets/FAQ.png"
                alt="FAQ Illustration"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
