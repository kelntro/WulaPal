import React, { useState, useEffect } from "react";
import { FaRegImage } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { HiUserGroup } from "react-icons/hi";
import "react-datepicker/dist/react-datepicker.css";

const SuccessModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-[60]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px] border border-gray-300 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-bold text-[#3A6953] mb-2">Success!</h3>
        <p className="text-gray-600 mb-6">Group created successfully!</p>
        <button
          onClick={onClose}
          className="w-full px-6 py-2 bg-[#6A8C73] text-white rounded-lg shadow-md hover:bg-[#3A6953]"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const CreateGroupModal = ({ onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [slots, setSlots] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Handle image selection
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  // Handle image selection
  const uploadImage = async (file) => {
    if (!file) return ""; // ✅ Ensure a file is selected

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:5050/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!data.url) throw new Error("Image upload failed.");

      console.log("📤 Uploaded image URL:", data.url); // ✅ Log the image URL
      return data.url; // ✅ Return the uploaded image URL
    } catch (error) {
      console.error("❌ Image upload failed:", error);
      return ""; // ✅ Return an empty string if upload fails
    }
  };

  const [frequency, setFrequency] = useState("Weekly");

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!groupName || !contributionAmount || !slots || !description || !frequency) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔹 Uploading image...");
      const imageUrl = image ? await uploadImage(image) : "";

      if (image && !imageUrl) {
        throw new Error("Image upload failed. Please try again.");
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const organizerName = user?.name || "Unknown Organizer";
      if (!organizerName) {
        throw new Error("Organizer name not found. Please log in again.");
      }
      const frequencyMap = {
        "Weekly": 300,        // 5 minutes
        "Bi-Weekly": 600,     // 10 minutes
        "Monthly": 900        // 15 minutes
      };
      
      const payload = {
        name: groupName,
        contributionAmount: parseFloat(contributionAmount),
        frequency: frequencyMap[frequency] * 1e6,
        requiredMembers: parseInt(slots),
        slots: parseInt(slots),
        description,
        handler: organizerName,
        image: imageUrl,
      };

      console.log("📤 Sending request to backend:", payload);

      const response = await fetch("http://localhost:5050/api/create-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("📥 Response from backend:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create group.");
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error("❌ Error in frontend:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[600px] border border-gray-300">
          <div className="flex items-center mb-4 border-b pb-3">
            <span className="text-[#3A6953] text-2xl mr-3"><HiUserGroup /></span>
            <h2 className="text-xl font-bold text-[#3A6953]">Add Paluwagan Group</h2>
          </div>
          <p className="text-[#3A6953] text-sm mb-6">Create your Paluwagan profile for free in less than 5 minutes.</p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center">
              <label className="w-1/3 text-[#3A6953] font-medium">Paluwagan name*</label>
              <input 
                type="text" 
                placeholder="e.g. Linear" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#99C6A9]" 
              />
            </div>

            <div className="flex items-center">
              <label className="w-1/3 text-[#3A6953] font-medium">Contribution*</label>
              <input 
                type="number" 
                placeholder="e.g. 2500" 
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                min={100}
                className={`w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-1 ${
                  contributionAmount && contributionAmount < 100
                    ? 'border-red-500 focus:ring-red-500'
                    : 'focus:ring-[#99C6A9]'
                }`}
              />
            </div>
            {contributionAmount && contributionAmount < 100 && (
              <p className="text-red-500 text-sm ml-[33%]">Minimum contribution amount is 100.</p>
            )}

            <div className="flex items-center">
              <label className="w-1/3 text-[#3A6953] font-medium">Profile image*</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="w-2/3 border p-2 rounded-lg cursor-pointer" 
              />
            </div>

            <div className="flex items-center">
              <label className="w-1/3 text-[#3A6953] font-medium">Frequency*</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#99C6A9]"
              >
                <option value="Weekly">Weekly</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1 w-full">
              <div className="flex items-center">
                <label className="w-1/3 text-[#3A6953] font-medium">Open Slots*</label>
                <input 
                  type="number" 
                  placeholder="Min. 2, Max. 12 Slots" 
                  value={slots}
                  onChange={(e) => setSlots(e.target.value)}
                  min={2}
                  max={12}
                  className={`w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-1 ${
                    slots && (slots < 2 || slots > 12)
                      ? 'border-red-500 focus:ring-red-500'
                      : 'focus:ring-[#99C6A9]'
                  }`}
                />
              </div>
              {slots && (slots < 2 || slots > 12) && (
                <p className="text-red-500 text-sm ml-[33%]">Slots must be between 2 and 12.</p>
              )}
            </div>

            <div className="flex items-center">
              <label className="w-1/3 text-[#3A6953] font-medium">Description*</label>
              <textarea 
                placeholder="Be a responsible member in this group. Be active on contribution period." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#99C6A9]" 
                rows="3"
              ></textarea>
            </div>

            <div className="flex justify-between mt-6">
              <button 
                type="button" 
                className="w-[200px] px-6 py-2 border border-[#6A8C73]-400 rounded-lg text-[#6A8C73] hover:bg-[#6A8C73]-300" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="w-[200px] px-6 py-2 bg-[#6A8C73] text-white rounded-lg shadow-md hover:bg-[#3A6953]"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {showSuccessModal && <SuccessModal onClose={handleSuccessClose} />}
    </>
  );
};

export default CreateGroupModal;
