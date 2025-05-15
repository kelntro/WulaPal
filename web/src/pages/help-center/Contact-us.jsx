import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiPhone, FiMail, FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const ContactUs = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z][A-Za-z\s]{0,50}$/;

    if (!nameRegex.test(formData.name)) {
      newErrors.name = "Please input your fullname.";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.message) {
      newErrors.message = "Message cannot be empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5050/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("Your message has been sent successfully! We'll get back to you soon.");
        setShowModal(true);
        setFormData({ name: "", email: "", message: "" });
        setErrors({});
      } else {
        setSuccessMessage("We couldn't send your message. Please try again later.");
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSuccessMessage("An unexpected error occurred. Please try again later.");
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 min-h-screen flex flex-col items-start ml-[110px]">
      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 relative shadow-2xl transform transition-all animate-scaleIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#6A8C73] hover:text-[#3A6953] transition-colors duration-200"
            >
              <FiX size={24} />
            </button>
            <div className="text-center">
              <div className="flex justify-center mb-6">
                {successMessage.includes("successfully") ? (
                  <FiCheckCircle className="text-[#285236] w-16 h-16" />
                ) : (
                  <FiAlertCircle className="text-[#6A8C73] w-16 h-16" />
                )}
              </div>
              <h3 className={`text-2xl font-semibold mb-4 ${successMessage.includes("successfully") ? "text-[#285236]" : "text-[#6A8C73]"}`}>
                {successMessage.includes("successfully") ? "Success!" : "Oops!"}
              </h3>
              <p className="text-[#6A8C73] mb-8 text-lg">
                {successMessage}
              </p>
              <button
                onClick={() => setShowModal(false)}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                  successMessage.includes("successfully")
                    ? "bg-[#285236] hover:bg-[#3A6953] text-white"
                    : "bg-[#6A8C73] hover:bg-[#3A6953] text-white"
                }`}
              >
                {successMessage.includes("successfully") ? "Great!" : "Try Again"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-[calc(100%-0.1rem)] max-w-7xl">
        <h1 className="text-4xl font-bold text-[#285236] mb-2">Help Center</h1>
        <p className="text-[#6A8C73] font-normal mb-6">Here's how to connect with us for anything you need.</p>

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
                {/* Name */}
                <div>
                  <label className="text-[#3A6953] font-medium block mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[A-Za-z\s]*$/.test(value) && value.length <= 30) {
                        setFormData({ ...formData, name: value });
                      }
                    }}
                    className="w-full p-3 border rounded-2xl border-[#99C6A9] text-[#6A8C73] focus:outline-none focus:border-[#285236]"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="text-[#3A6953] font-medium block mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 border rounded-2xl border-[#99C6A9] text-[#6A8C73] focus:outline-none focus:border-[#285236]"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Message */}
                <div>
                  <label className="text-[#3A6953] font-medium block mb-1">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 border rounded-2xl border-[#99C6A9] text-[#6A8C73] focus:outline-none focus:border-[#285236]"
                    rows="4"
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-[#6A8C73] text-white font-bold py-3 rounded-2xl transition-all duration-200 ${
                    isSubmitting 
                      ? "opacity-70 cursor-not-allowed" 
                      : "hover:bg-[#3A6953] hover:shadow-lg"
                  }`}
                >
                  {isSubmitting ? "Sending..." : "Submit"}
                </button>
              </form>
            </div>

            {/* Right - Contact Info */}
            <div className="w-1/2 flex justify-end">
              <div className="w-2/3 space-y-4 text-[#6A8C73]">
                <img src="/assets/contact-us.png" alt="Contact Us Illustration" className="w-full mb-6 ml-[-80px]" />
                <div className="flex items-center space-x-3">
                  <FiMapPin className="text-[#3A6953] text-xl" />
                  <p>57 Building 2, Generoso St., Obrero, Buhangin, Davao City, Davao del Sur, 8000</p>
                </div>
                <div className="flex items-center space-x-3">
                  <FiPhone className="text-[#3A6953] text-xl" />
                  <p>+63 9544852365</p>
                </div>
                <div className="flex items-center space-x-3">
                  <FiMail className="text-[#3A6953] text-xl" />
                  <p>rams_company@gmail.com</p>
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
