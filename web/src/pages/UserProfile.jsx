"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch(`http://localhost:5050/api/users/${userId}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("❌ Error fetching user:", err.message);
      setError("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = () => {
    navigate(`/message/${userId}`);
  };

  return (
    <div className="min-h-screen bg-[#f7faf9] p-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        {loading ? (
          <div className="text-gray-600 animate-pulse">Loading user...</div>
        ) : error ? (
          <div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-[#285236] mb-4">{user.name}</h1>
            <p className="text-gray-700 mb-2">Email: {user.email}</p>
            <p className="text-gray-400 mb-6">User ID: {user._id}</p>

            <button
              onClick={handleMessageClick}
              className="px-6 py-3 bg-[#3A6953] hover:bg-[#285236] text-white rounded-full text-lg"
            >
              Message
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
