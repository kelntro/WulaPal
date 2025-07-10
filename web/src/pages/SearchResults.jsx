"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchQuery) {
      fetchResults();
    }
  }, [searchQuery]);

  const fetchResults = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("🔍 Fetching search results for:", searchQuery);
      const res = await fetch(`http://localhost:5050/api/users/search?q=${searchQuery}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      console.log("✅ Search results received:", data);
      if (!Array.isArray(data)) throw new Error("Unexpected response format");
      setResults(data);
    } catch (err) {
      console.error("❌ Error fetching search results:", err.message);
      setError("Failed to load search results. Please try again.");
    } finally {
      setLoading(false);
    }
  };  


  const handleClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  return (
    <div className="min-h-screen bg-[#D4E8DB] p-10">
      <div className="max-w-4xl mx-auto">
         <div className="flex items-center justify-start gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center bg-[#6A8C73] text-white px-6 py-2 rounded-2xl shadow-md hover:bg-[#285236] transition"
            >
              <HiArrowLeft className="text-xl" />
            </button>
            <h1 className="text-4xl font-bold text-[#285236]">
              Search Results for <span className="text-[#3A6953]">"{searchQuery}"</span>
            </h1>
          </div>

        {loading ? (
          <div className="text-gray-600 text-lg animate-pulse">Loading...</div>
        ) : error ? (
          <div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-gray-500 text-lg">No users found.</div>
        ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
            {results.map((user) => {
  console.log("👤 Rendering user:", user);
  console.log("🖼️ Profile image source:", user.profileImage);

  return (
    <div
      key={user._id}
      className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
      onClick={() => handleClick(user._id)}
    >
      <div className="flex items-center gap-4">
        <img
          src={user.profileImage || "/assets/Profile.jpg"}
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover"
          onError={(e) => {
            console.warn("⚠️ Failed to load image for:", user.name);
            e.target.src = "/assets/Profile.jpg";
          }}
        />
        <div>
          <h2 className="text-2xl font-semibold text-[#3A6953] mb-1">{user.name}</h2>
          <p className="text-gray-700">{user.email}</p>
          <p className="text-gray-400 text-sm mt-1">User ID: {user._id}</p>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-yellow-500 text-lg">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index}>
                  {user.rating && user.rating >= index + 1 ? "★" : "☆"}
                </span>
              ))}
            </span>
            <span className="text-sm text-gray-600">
              {user.ratingPercentage || 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
})}

          </div>

        )}
      </div>
    </div>
  );
};

export default SearchResults;
