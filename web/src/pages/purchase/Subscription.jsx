import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { IoCheckmarkCircle } from "react-icons/io5";
import { IoCheckmark } from "react-icons/io5";
import { HiMiniXMark } from "react-icons/hi2";
import { BsInfoCircle } from "react-icons/bs";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import logo from "/assets/WulaPal_sidebar.png"; // Replace with the actual path to your logo

const Subscription = () => {
  const [billingCycle, setBillingCycle] = useState("annually");
  const navigate = useNavigate(); // Initialize navigate

  const plans = [
    {
      name: "Free",
      price: "₱0",
      description: "For Small Teams",
      features: [
        "Real-time contact syncing",
        "Automatic data enrichment",
        "Up to 3 seats",
      ],
      buttonText: "Your Plan",
    },
    {
      name: "Basic",
      price: "₱250",
      discount: "15%",
      description: "For Growing Teams",
      features: [
        "Private lists",
        "Enhanced email sending",
        "No seat limits",
        "Up to 3 seats",
      ],
      buttonText: "Get Started",
    },
    {
      name: "Pro",
      price: "₱350",
      discount: "15%",
      description: "For Scaling Businesses",
      features: [
        "Fully adjustable permissions",
        "Advanced data enrichment",
        "Priority support",
        "Up to 3 seats",
      ],
      buttonText: "Get Started",
    },
    {
      name: "Enterprise",
      price: "₱450",
      description: "For Big Corporation",
      features: [
        "Unlimited reporting",
        "SAML and SSO",
        "Custom billing",
        "Up to 3 seats",
      ],
      buttonText: "Get Started",
    },
  ];

  return (
    <div className="relative flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <button onClick={() => navigate("/dashboard")} className="absolute top-4 right-4 bg-[#3A6953] text-white px-6 py-2 rounded-lg">
        Go Back
      </button>

      <h1 className="mt-[60px] text-4xl font-bold text-green-900 text-center">
        From Free to Enterprise Plan.
      </h1>
      <p className="text-gray-600 text-center mt-2">
        Perfectly tailored for every stage of your growth. Get started today, no credit card needed.
      </p>
      
      <div className="mt-6 flex gap-2 p-2 rounded-lg border border-[#E4E4E4]">
        <button 
          className={`px-4 py-2 rounded ${billingCycle === "monthly" ? "bg-[#3A6953] text-white" : "bg-gray-100 text-[#3A6953]"}`}
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly
        </button>
        <button 
          className={`px-4 py-2 rounded ${billingCycle === "annually" ? "bg-[#3A6953] text-white" : "bg-gray-100 text-[#3A6953]"}`}
          onClick={() => setBillingCycle("annually")}
        >
          Annually
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="p-6 rounded-lg border border-[#E4E4E4] text-left text-[#3A6953]"
          >
            <h2 className="text-2xl font-bold">{plan.name}</h2>
            <p className="text-3xl font-semibold mt-2 text-[#3A6953]">
              {plan.price} {plan.discount && <span className="text-[12px] bg-[#99C6A9] text-white px-1 py-1 rounded-md">{plan.discount}</span>}
            </p>
            <p className="mt-2 text-sm text-[#6A8C73]">{plan.description}</p>
            <ul className="mt-4 text-sm text-[#6A8C73]">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2"><IoCheckmarkCircle /> {feature}</li>
              ))}
            </ul>
            <button
              className="mt-6 px-6 py-2 w-full rounded-lg font-semibold bg-gray-100 text-[#3A6953] border border-[#3A6953]"
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-12 w-full max-w-6xl">
        <h2 className="text-3xl font-bold text-green-900">Paluwagan Plan Comparison</h2>

        {/* Workspace*/}
      <div className="w-full max-w-6xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-[#3A6953] mb-4">Workspace</h2>
      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4">
        <div className="font-medium">Number of seats</div>
        <div>Up to 3</div>
        <div>Unlimited</div>
        <div>Unlimited</div>
        <div>Unlimited</div>
      </div>
      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium">Number of objects</div>
        <div>Up to 3</div>
        <div>Up to 8</div>
        <div>Up to 12</div>
        <div>Unlimited</div>
      </div>

        {/* Automation*/}
      <h2 className="text-2xl font-bold text-[#3A6953] mt-8 mb-4">Automations</h2>
      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4">
        <div className="font-medium flex items-center gap-[73px]">
          Number of credits <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div>200</div>
        <div>2000</div>
        <div>4000</div>
        <div>5000+</div>
      </div>
    </div>
      </div>

        {/*Email and celendar*/}
      <div className="w-full max-w-6xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-[#3A6953] mb-4">Email and Calendar</h2>
      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium flex items-center gap-[30px]">
          Email and calendar sync <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div>1 account per user</div>
        <div>2 account per user</div>
        <div>4 account per user</div>
        <div>10+ account per user</div>
      </div>

      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium flex items-center gap-[105px]">
          Email sharing <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div>Individual metadata</div>
        <div>Individual attachments</div>
        <div>Specific contacts</div>
        <div>Specific contacts</div>
      </div>

      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium flex items-center gap-[55px]">
          Email sends amount <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div>500 sends per month</div>
        <div>1000 sends per month</div>
        <div>Unlimited</div>
        <div>Unlimited</div>
      </div>

      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium flex items-center gap-[63px]">
          Bulk email sending <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div>10 sends at a time</div>
        <div>20 sends at a time</div>
        <div>50 sends at a time</div>
        <div>100 sends at a time</div>
      </div>

      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium flex items-center gap-[18px]">
          Remove email watermark <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div><HiMiniXMark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
      </div>
    </div>

        {/*Reports*/}
        <div className="w-full max-w-6xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-[#3A6953] mb-4">Reporting</h2>
      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4">
        <div className="font-medium flex items-center gap-[70px]">
          Number of reports <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div>3 reports</div>
        <div>20 reports</div>
        <div>100 reports</div>
        <div>Unlimited</div>
      </div>

      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium flex items-center gap-[95px]">
          Insight Reports <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
      </div>

      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium flex items-center gap-[107px]">
          Sales Reports <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div><HiMiniXMark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
      </div>

      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium flex items-center gap-[88px]">
          Activity Reports <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div><HiMiniXMark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
      </div>

      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium flex items-center gap-[103px]">
          Email Reports <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div><HiMiniXMark /></div>
        <div><HiMiniXMark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
      </div>
    </div>

        {/*Others*/}
        <div className="w-full max-w-6xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-[#3A6953] mb-4">Admin</h2>
      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4">
        <div className="font-medium flex items-center gap-[85px]">
          Payment invoice <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div><HiMiniXMark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
      </div>

      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium flex items-center gap-[116px]">
          SAML (SSO) <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div><HiMiniXMark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
      </div>

      <h2 className="text-2xl font-bold text-[#3A6953] mt-8 mb-4">Support</h2>
      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4">
        <div className="font-medium flex items-center gap-[118px]">
          Help center <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
      </div>

      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium flex items-center gap-[30px]">
          Chat and email support <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
      </div>

      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium flex items-center gap-[85px]">
          Priority support <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div><HiMiniXMark /></div>
        <div><HiMiniXMark /></div>
        <div><IoCheckmark /></div>
        <div><IoCheckmark /></div>
      </div>

      <div className="grid grid-cols-5 text-left text-gray-600 border-b border-gray-200 pb-4 mt-4">
        <div className="font-medium flex items-center gap-[50px]">
          Migration assistance <span className="text-gray-400 text-sm"><BsInfoCircle /></span>
        </div>
        <div><HiMiniXMark /></div>
        <div>Chat with us</div>
        <div>Chat with us</div>
        <div>Chat with us</div>
      </div>
    </div>

    <footer className="w-full mt-[30px] p-[30px] flex items-center justify-between px-[60px] bg-[#3A6953]">
      {/* Logo */}
      <img src={logo} alt="WulaPal Logo" className="h-[50px]" />
      
      {/* Social Media Icons */}
      <div className="flex gap-2">
        <a href="#" className="text-[#3A6953] bg-white p-2 rounded-full shadow-md hover:opacity-80 transition">
          <FaInstagram size={16} />
        </a>
        <a href="#" className="text-[#3A6953] bg-white p-2 rounded-full shadow-md hover:opacity-80 transition">
          <FaFacebookF size={16} />
        </a>
        <a href="#" className="text-[#3A6953] bg-white p-2 rounded-full shadow-md hover:opacity-80 transition">
          <FaLinkedinIn size={16} />
        </a>
        <a href="#" className="text-[#3A6953] bg-white p-2 rounded-full shadow-md hover:opacity-80 transition">
          <FaTwitter size={16} />
        </a>
      </div>
    </footer>

    </div>
  );
};

export default Subscription;
