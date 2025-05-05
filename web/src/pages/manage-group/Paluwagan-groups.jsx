import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineSearch } from "react-icons/hi";
import { FaUsers, FaCheckCircle } from "react-icons/fa";
import { FaArrowsRotate } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import CreateGroupModal from "./CreateGroupModal";
import io from "socket.io-client";

const SERVER_URL = "http://localhost:5050";

const PaluwaganGroups = () => {
  const [showModal, setShowModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState(""); // ✅ For search
  const [organizerId, setOrganizerId] = useState(null);
  const navigate = useNavigate();

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
            Here’s your Paluwagan groups and manage your own group.
          </p>
        </div>
      </div>

      {/* Search & Create Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-3/4">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Quick Search..."
            className="w-[650px] p-2 pl-10 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6A8C73]"
            value={search}
            onChange={(e) => setSearch(e.target.value)} // ✅ Handle search input
          />
        </div>
        <button
  onClick={() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const missing = getMissingProfileFields(user);
  
    if (missing.length > 0) {
      const confirmRedirect = window.confirm(
        `⚠️ Please complete your profile before creating a Paluwagan group.\n\nMissing fields:\n- ${missing.join("\n- ")}\n\nGo to Profile Info now?`
      );
      if (confirmRedirect) {
        navigate("/profile/profile-information"); // 🔁 Replace with your actual route path
      }
      return;
    }
  
    setShowModal(true);
  }}
  
  className="bg-[#3A6953] text-white px-4 py-2 pr-5 rounded-[20px] flex items-center shadow-md hover:bg-[#6A8C73] transition mr-6"
>
  <span className="mr-1">
    <FiPlus />
  </span>
  Create a Paluwagan
</button>

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

export default PaluwaganGroups;
