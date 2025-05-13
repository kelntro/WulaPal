import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineSearch } from "react-icons/hi";
import { FaUsers, FaCheckCircle } from "react-icons/fa";
import { FaArrowsRotate } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import { PiUserListBold } from "react-icons/pi";
import CreateGroupModal from "./CreateGroupModal";
import io from "socket.io-client";

const SERVER_URL = "http://localhost:5050";

const PaluwaganGroups = () => {
  const [showModal, setShowModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState(""); // ✅ For search
  const [organizerId, setOrganizerId] = useState(null);
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  const socket = io(SERVER_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    timeout: 10000,
  });

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser && loggedInUser.name) {
      setOrganizerId(loggedInUser.name);
    } else {
      console.error("❌ No logged-in user found!");
    }
  }, []);

  useEffect(() => {
    if (organizerId) {
      fetchGroups();
    }

    return () => {
      socket.disconnect();
    };
  }, [organizerId]);

  const getMissingProfileFields = (user) => {
    const missingFields = [];
  
    if (!user.name) missingFields.push("Name");
    if (!user.email) missingFields.push("Email");
    if (!user.mobile) missingFields.push("Mobile Number");
    if (!user.country) missingFields.push("Country");
    if (!user.dateofBirth) missingFields.push("Date of Birth");
    if (!user.gender) missingFields.push("Gender");
    if (!user.occupation) missingFields.push("Occupation");
    if (!user.sourceOfFunds) missingFields.push("Source of Funds");
    if (!user.idType) missingFields.push("ID Type");
    if (!user.idImage) missingFields.push("ID Image");
    if (!user.profileImage) missingFields.push("Profile Picture");
  
    // Address fields
    if (!user.address?.street) missingFields.push("Street");
    if (!user.address?.barangay) missingFields.push("Barangay");
    if (!user.address?.city) missingFields.push("City");
    if (!user.address?.province) missingFields.push("Province");
    if (!user.address?.zipCode) missingFields.push("Zip Code");
  
    // Emergency contact
    if (!user.emergencyContact?.name) missingFields.push("Emergency Contact Name");
    if (!user.emergencyContact?.mobile) missingFields.push("Emergency Contact Mobile");
  
    return missingFields;
  };
  
  
  
  const fetchGroups = () => {
    fetch(`${SERVER_URL}/api/organizer-groups?organizerId=${organizerId}`)
      .then(async (response) => {
        const text = await response.text();
        console.log("📥 Raw API Response:", text);
        return JSON.parse(text);
      })
      .then((data) => {
        console.log("✅ Organizer Groups:", data);
        setGroups(data);
      })
      .catch((error) => console.error("❌ Error fetching groups:", error));

    socket.on("groupUpdated", (updatedGroup) => {
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === updatedGroup._id ? updatedGroup : group
        )
      );
    });
  };

  // ✅ Filter based on search
  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-2 sm:ml-[90px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#285236]">
            Paluwagan Groups
          </h1>
          <p className="text-[#6A8C73] font-normal">
            Here's your Paluwagan groups and manage your own group.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        {/* Search Bar */}
        <div className="relative w-3/4">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Quick Search..."
            className="w-[600px] border border-[#99C6A9] rounded-full pl-12 pr-4 py-2 text-sm focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 ml-6">
          <button
            onClick={async () => {
              try {
                const storedUser = JSON.parse(localStorage.getItem("user"));
                const response = await fetch(`http://localhost:5050/api/users/${storedUser._id}`);
                const freshUser = await response.json();

                localStorage.setItem("user", JSON.stringify(freshUser));
                const missing = getMissingProfileFields(freshUser);

                if (missing.length > 0) {
                  setMissingFields(missing);
                  setShowProfileModal(true);
                  return;
                }

                setShowModal(true);
              } catch (err) {
                console.error("❌ Failed to fetch updated user profile:", err);
                alert("Unable to verify your profile. Please try again later.");
              }
            }}
            className="w-[230px] bg-[#3A6953] text-white px-4 py-2 rounded-full shadow-md flex items-center justify-center space-x-2 hover:bg-[#6A8C73] transition"
          >
            <FiPlus className="text-white text-lg" />
            <span className="text-sm font-medium">Create a Paluwagan</span>
          </button>

          <button
            onClick={() => navigate("/group/join-requests")}
            className="w-[230px] bg-[#3A6953] text-white px-4 py-2 rounded-full shadow-md flex items-center justify-center space-x-2 hover:bg-[#6A8C73] transition"
          >
            <span className="text-lg"><PiUserListBold /></span>
            <span className="text-sm font-medium">View Join Requests</span>
          </button>
        </div>
      </div>



      {/* Create Group Modal */}
      {showModal && (
        <CreateGroupModal
          onClose={() => {
            setShowModal(false);
            fetchGroups();
          }}
        />
      )}

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        open={showProfileModal}
        missing={missingFields}
        onConfirm={() => {
          setShowProfileModal(false);
          navigate("/profile/profile-information");
        }}
        onCancel={() => setShowProfileModal(false)}
      />

      {/* Groups Grid */}
      <div className="flex flex-wrap justify-center gap-[20px] mr-[30px]">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <div
              key={group._id}
              className="bg-white rounded-[20px] shadow-lg p-4 flex-1 min-w-[300px] max-w-[350px]"
            >
              <div className="w-full h-[140px] rounded-t-[20px] overflow-hidden">
                <img
                  src={group.image || "/assets/default.jpg"}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-bold text-[#285236]">
                  {group.name}
                </h2>
                <p className="text-gray-600 text-sm mb-2">
                  {group.description || "No description provided."}
                </p>
                <div className="flex items-center text-[#6A8C73] text-sm mb-1">
                  <FaUsers className="mr-2 text-[#3A6953]" />
                  {group.members.length}/{group.slots} Slots
                </div>
                <div className="flex items-center text-[#6A8C73] text-sm mb-1">
                  <FaArrowsRotate className="mr-2 text-[#3A6953]" /> ₱
                  {group.contributionAmount} {group.frequency}
                </div>
                <div className="flex items-center text-[#6A8C73] text-sm mb-4">
                  <FaCheckCircle className="mr-2 text-[#3A6953]" />
                  {group.status}
                </div>
                <button
                  className="bg-[#6A8C73] text-white w-full px-4 py-2 rounded-[20px] shadow-md hover:bg-[#3A6953] transition"
                  onClick={() => {
                    if (!group._id) {
                      console.error(
                        "❌ Group ID is undefined. Cannot navigate."
                      );
                      return;
                    }
                    console.log("🔗 Navigating to Group Members:", group._id);
                    navigate(`/group-members/${group._id}`);
                  }}
                >
                  View Group
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center w-full">No groups found.</p>
        )}
      </div>
    </div>
  );
};

// Modal component
const ProfileCompletionModal = ({ open, missing, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-[#285236] mb-2">Complete Your Profile</h2>
        <p className="text-gray-700 mb-4">Please complete your profile before creating a Paluwagan group.</p>
        <ul className="mb-4 list-disc list-inside text-sm text-[#9B2C2C]">
          {missing.map((field) => (
            <li key={field}>Missing: <span className="font-semibold">{field}</span></li>
          ))}
        </ul>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded bg-[#3A6953] text-white font-semibold hover:bg-[#285236] transition"
            onClick={onConfirm}
          >
            Go to Profile Info
          </button>
          <button
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaluwaganGroups;
