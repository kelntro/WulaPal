import React from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";

const ContactUs = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 min-h-screen flex flex-col items-start ml-64">
      <div className="w-[calc(100%-0.1rem)] max-w-7xl">
        <h1 className="text-4xl font-bold text-[#285236] mb-2">Help Center</h1>
        <p className="text-[#6A8C73] font-normal mb-6">Here’s your settings for security.</p>

        <div className="bg-white shadow-md rounded-lg p-6 w-full flex flex-col">
          {/* Tabs */}
          <div className="flex pb-2 mb-4">
            <h2 
              className="text-xl text-gray-400 pb-2 cursor-pointer hover:text-[#3A6953]"
              onClick={() => navigate("/help-center")}
            >
              FAQ
            </h2>
            <h2 
              className="text-xl font-semibold text-[#3A6953] pb-2 ml-6 border-b-2 border-[#285236] cursor-pointer"
            >
              Contact Us
            </h2>
          </div>

          {/* Contact Section */}
          <div className="flex justify-between items-center">
            {/* Left - Contact Form */}
            <div className="w-1/2">
              <h2 className="text-2xl font-semibold text-[#3A6953] mb-4">Get in touch</h2>
              <p className="text-[#6A8C73] font-normal mb-6">
                We are here for you! How can we help?
              </p>

              <form className="space-y-4">
                <div>
                  <label className="text-[#3A6953] font-medium block mb-1">Name</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border rounded-2xl border-[#99C6A9] text-[#6A8C73] focus:outline-none focus:border-[#285236]"
                  />
                </div>
                <div>
                  <label className="text-[#3A6953] font-medium block mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-3 border rounded-2xl border-[#99C6A9] text-[#6A8C73] focus:outline-none focus:border-[#285236]"
                  />
                </div>
                <div>
                  <label className="text-[#3A6953] font-medium block mb-1">Message</label>
                  <textarea 
                    className="w-full p-3 border rounded-2xl border-[#99C6A9]  text-[#6A8C73] focus:outline-none focus:border-[#285236]" 
                    rows="4"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#6A8C73] text-white font-bold py-3 rounded-2xl hover:bg-[#3A6953] transition"
                >
                  Submit
                </button>
              </form>
            </div>

            {/* Right - Contact Information */}
            <div className="w-1/2 flex justify-end">
              <div className="w-2/3 space-y-4 text-[#6A8C73]">
                <img src="/assets/contact-us.png" alt="Contact Us Illustration" className="w-full mb-6" />
                <div className="flex items-center space-x-3">
                  <FiMapPin className="text-[#3A6953] text-xl" />
                  <p>Mapagmahal Street, Barangay ILY</p>
                </div>
                <div className="flex items-center space-x-3">
                  <FiPhone className="text-[#3A6953] text-xl" />
                  <p>+63 9143 143 1431</p>
                </div>
                <div className="flex items-center space-x-3">
                  <FiMail className="text-[#3A6953] text-xl" />
                  <p>ram_s@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;
