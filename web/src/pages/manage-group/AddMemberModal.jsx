import React, { useState } from "react";
import { BsPersonSquare } from "react-icons/bs";

const SERVER_URL = "http://localhost:5050";

const AddMemberModal = ({ groupId, onClose, onMemberAdded }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // ✅ Search for users by account number, email, or name
  const searchUser = () => {
    if (!searchQuery) {
      alert("Please enter an account number, email, or name.");
      return;
    }

    setLoading(true);
    fetch(`${SERVER_URL}/api/users/find?query=${encodeURIComponent(searchQuery)}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || "Failed to fetch users.") });
        }
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

  // ✅ Select user from search results
  const selectUser = (user) => {
    setSelectedUser(user);
    setConfirming(true); // Open confirmation modal
  };

  // ✅ Add the selected user to the group
  const confirmAddMember = () => {
    if (!selectedUser) {
      alert("No user selected!");
      return;
    }

    fetch(`${SERVER_URL}/api/groups/${groupId}/add-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountNumber: selectedUser.email }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || "Failed to add member.") });
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Member added successfully!");
        onMemberAdded(data.members); // ✅ Refresh member list
        onClose();
      })
      .catch((err) => {
        setError("Error adding member.");
        console.error("❌ Error:", err);
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center space-x-2 mb-4">
          <BsPersonSquare className="text-[#3A6953] text-2xl" />
          <h2 className="text-xl font-bold text-[#3A6953]">Add a Member</h2>
        </div>
        <p className="text-[#3A6953] text-sm mb-4">
          Enter an account number, email, or name to find and add a member.
        </p>

        {/* Search Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#3A6953]">Search*</label>
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

        {/* Show Search Results */}
        {error && <p className="text-red-500">{error}</p>}
        {users.length > 0 && (
          <div className="mb-4 p-3 border rounded-md">
            <h3 className="text-lg font-bold mb-2">Select a Member:</h3>
            {users.map((user) => (
              <div
                key={user.userId}
                className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => selectUser(user)}
              >
                <p><strong>User ID:</strong> {user.userId}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Modal */}
        {confirming && selectedUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-lg">Are you sure you want to add <strong>{selectedUser.name}</strong> to this group?</p>
              <div className="mt-4 flex justify-center space-x-4">
                <button onClick={() => setConfirming(false)} className="px-4 py-2 bg-gray-400 text-white rounded-md">Cancel</button>
                <button onClick={confirmAddMember} className="px-4 py-2 bg-[#6A8C73] text-white rounded-md">Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMemberModal;
