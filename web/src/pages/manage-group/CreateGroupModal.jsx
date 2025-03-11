import React, { useState } from "react";
import { FaRegImage } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { HiUserGroup } from "react-icons/hi";
import "react-datepicker/dist/react-datepicker.css";

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
  const [successMessage, setSuccessMessage] = useState(null);

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


  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!groupName || !contributionAmount || !startDate || !endDate || !slots || !description) {
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

        const organizerName = localStorage.getItem("userName");
        if (!organizerName) {
            throw new Error("Organizer name not found. Please log in again.");
        }

        const payload = {
            name: groupName,
            contributionAmount: parseFloat(contributionAmount),
            frequency: 604800,
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

        // ✅ Show success message instead of alert
        setSuccessMessage("Group created successfully!");
        setTimeout(() => {
            setSuccessMessage(null);
            onClose();
        }, 2000);
    } catch (err) {
        console.error("❌ Error in frontend:", err.message);
        setError(err.message);
    } finally {
        setLoading(false);
    }
};


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[600px] border border-gray-300">
      {successMessage && (
    <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center">
        {successMessage}
    </div>
)}
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
            <label className="w-1/3 text-[#3A6953] font-medium">Monthly Contribution*</label>
            <input 
              type="number" 
              placeholder="e.g. 2500" 
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              className="w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#99C6A9]" 
            />
          </div>

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
            <label className="w-1/3 text-[#3A6953] font-medium">Date Contribution*</label>
            <div className="w-2/3 flex space-x-2">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className="p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#99C6A9] w-full"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                placeholderText="End Date"
                className="p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#99C6A9] w-full"
              />
            </div>
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-[#3A6953] font-medium">Open Slots*</label>
            <input 
              type="number" 
              placeholder="Max. of 12 Slots" 
              value={slots}
              onChange={(e) => setSlots(e.target.value)}
              className="w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#99C6A9]" 
            />
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
  );
};

export default CreateGroupModal;
