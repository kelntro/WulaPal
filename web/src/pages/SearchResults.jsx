"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
      const res = await fetch(`http://localhost:5050/api/users/search?q=${searchQuery}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
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
    <div className="min-h-screen bg-[#f7faf9] p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#285236] mb-8">
          Search Results for <span className="text-[#3A6953]">"{searchQuery}"</span>
        </h1>

        {loading ? (
          <div className="text-gray-600 text-lg animate-pulse">Loading...</div>
        ) : error ? (
          <div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-gray-500 text-lg">No users found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((user) => (
              <div
                key={user._id}
                className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => handleClick(user._id)}
              >
                <h2 className="text-2xl font-semibold text-[#3A6953] mb-2">{user.name}</h2>
                <p className="text-gray-700">{user.email}</p>
                <p className="text-gray-400 text-sm mt-2">User ID: {user._id}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
