import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiPhone, FiMail, FiX } from "react-icons/fi";

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      // Simulate API call with 2 second delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Here you would typically send the data to your backend
      console.log("Form submitted:", formData);
      setIsLoading(false);
      setShowSuccessModal(true);
      setFormData({ name: "", email: "", message: "" });
    }
  };

  return (
    <div className="p-2 min-h-screen flex flex-col items-start ml-[110px]">
      <div className="w-[calc(100%-0.1rem)] max-w-7xl">
        <h1 className="text-4xl font-bold text-[#285236] mb-2">Help Center</h1>
        <p className="text-[#6A8C73] font-normal mb-6">Here's your settings for security.</p>

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
            <div className="w-1/2 mt-[-80px]">
              <h2 className="text-2xl font-semibold text-[#3A6953] mb-4">Get in touch</h2>
              <p className="text-[#6A8C73] font-normal mb-6">
                We are here for you! How can we help?
              </p>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-[#3A6953] font-medium block mb-1">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-2xl ${errors.name ? 'border-red-500' : 'border-[#99C6A9]'} text-[#6A8C73] focus:outline-none focus:border-[#285236]`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-[#3A6953] font-medium block mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-2xl ${errors.email ? 'border-red-500' : 'border-[#99C6A9]'} text-[#6A8C73] focus:outline-none focus:border-[#285236]`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="text-[#3A6953] font-medium block mb-1">Message</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-2xl ${errors.message ? 'border-red-500' : 'border-[#99C6A9]'} text-[#6A8C73] focus:outline-none focus:border-[#285236]`}
                    rows="4"
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`w-full bg-[#6A8C73] text-white font-bold py-3 rounded-2xl transition ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#3A6953]'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </div>
                  ) : (
                    'Submit'
                  )}
                </button>
              </form>
            </div>

            {/* Right - Contact Information */}
            <div className="w-1/2 flex justify-end">
              <div className="w-2/3 space-y-4 text-[#6A8C73]">
                <img src="/assets/contact-us.png" alt="Contact Us Illustration" className="w-full mb-6 ml-[-80px]" />
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#3A6953] mb-2">Message Sent!</h3>
              <p className="text-[#6A8C73]">Thank you for contacting us. We'll get back to you soon.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUs;
