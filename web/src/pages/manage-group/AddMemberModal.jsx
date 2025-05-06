import React, { useState, useRef, useEffect } from "react";
import { BsPersonSquare } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const SERVER_URL = "http://localhost:5050";

const AddMemberModal = ({ groupId, onClose, onMemberAdded }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
        navigate(`/group-members/${groupId}`);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [groupId, navigate, onClose]);

  const searchUser = () => {
    if (!searchQuery) {
      setError("Please enter a valid search query.");
      return;
    }

    setLoading(true);
    fetch(
      `${SERVER_URL}/api/users/find?query=${encodeURIComponent(searchQuery)}`
    )
      .then((res) => {
        if (!res.ok)
          return res.json().then((err) => {
            throw new Error(err.error || "Failed to fetch users.");
          });
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setError(null);
      })
      .catch((err) => {
        setError("Error fetching users.");
        console.error("❌ Error:", err);
      })
      .finally(() => setLoading(false));
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setConfirming(true);
  };

  const confirmAddMember = () => {
    if (!selectedUser) return setError("No user selected!");

    fetch(`${SERVER_URL}/api/groups/${groupId}/add-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountNumber: selectedUser.email }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err?.error || "Failed to add member.");
          });
        }
        return res.json();
      })
      .then((data) => {
        setSuccessMessage(data.message || "Invitation sent successfully.");
        setSelectedUser(null);
        setConfirming(false);
      })
      .catch((err) => {
        console.error("❌ Error:", err);
        setError(err.message); // ✅ Show full message from backend
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md relative"
      >
        {/* Header */}
        <div className="flex items-center space-x-2 mb-4">
          <BsPersonSquare className="text-[#3A6953] text-2xl" />
          <h2 className="text-xl font-bold text-[#3A6953]">Add a Member</h2>
        </div>
        <p className="text-[#3A6953] text-sm mb-4">
          Enter an account number, email, or name to find and add a member.
        </p>

        {/* Search Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#3A6953]">
            Search*
          </label>
          <input
            type="text"
            placeholder="User ID, Email, or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#99C6A9]"
          />
          <button
            onClick={searchUser}
            className="mt-2 w-full px-4 py-2 bg-[#6A8C73] text-white rounded-md hover:bg-[#3A6953]"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* User List */}
        {users.length > 0 && (
          <div className="mb-4 p-3 border rounded-md">
            <h3 className="text-lg font-bold mb-2">Select a Member:</h3>
            {users.map((user) => (
              <div
                key={user._id}
                className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => selectUser(user)}
              >
                <p>
                  <strong>User ID:</strong> {user.userId || user._id}
                </p>
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Modal */}
        {confirming && selectedUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-lg">
                Are you sure you want to add{" "}
                <strong>{selectedUser.name}</strong> to this group?
              </p>
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={() => setConfirming(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddMember}
                  className="px-4 py-2 bg-[#6A8C73] text-white rounded-md"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {error && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-sm w-full">
              <h3 className="text-lg font-bold text-red-600 mb-2">❌ Error</h3>
              <p className="text-gray-700 mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {successMessage && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-sm w-full">
              <h3 className="text-lg font-bold text-green-600 mb-2">
                ✅ Invite Sent
              </h3>
              <p className="text-gray-700 mb-4">{successMessage}</p>
              <button
                onClick={() => {
                  setSuccessMessage(null);
                  onClose(); // return to group-members screen
                  navigate(`/group-members/${groupId}`);
                }}
                className="px-4 py-2 bg-[#3A6953] text-white rounded hover:bg-[#285236] transition"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMemberModal;
