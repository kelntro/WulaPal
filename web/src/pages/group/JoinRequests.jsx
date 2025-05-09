import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const JoinRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`http://localhost:5050/api/organizer/join-requests/${user._id}`);
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error("❌ Failed to load join requests:", err.message);
      }
    };

    if (user?._id) fetchRequests();
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">📥 Pending Join Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="border p-4 rounded shadow bg-white">
              <p className="mb-2">📢 <strong>{req.message}</strong></p>
              <div className="flex gap-4">
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    onClick={() => navigate(`/user/${req.userId}`)}
                >
                    View Profile
                </button>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={async () => {
                    try {
                        const res = await fetch(`http://localhost:5050/api/groups/${req.groupId}/approve-request`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: req.userId }),
                        });
                        const data = await res.json();
                        alert(data.message || "Approved");
                        setRequests((prev) => prev.filter((r) => r._id !== req._id));
                    } catch (err) {
                        console.error("❌ Approval failed:", err);
                        alert("Failed to approve request.");
                    }
                    }}
                >
                    Approve & Notify
                </button>
                <button
                    className="bg-red-600 text-white px-4 py-2 rounded"
                    onClick={async () => {
                    try {
                        const res = await fetch(`http://localhost:5050/api/groups/${req.groupId}/decline-request`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: req.userId }),
                        });
                        const data = await res.json();
                        alert(data.message || "Declined");
                        setRequests((prev) => prev.filter((r) => r._id !== req._id));
                    } catch (err) {
                        console.error("❌ Decline failed:", err);
                        alert("Failed to decline request.");
                    }
                    }}
                >
                    Decline
                </button>
                </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JoinRequests;
