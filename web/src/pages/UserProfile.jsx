"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import SideMessageModal from "./SideMessageModal"; // Update import

const getLastActiveLabel = (timestamp) => {
  if (!timestamp) return "Offline";
  const last = new Date(timestamp);
  const now = new Date();
  const diffMins = Math.floor((now - last) / 60000);

  if (diffMins < 1) return "Active now";
  if (diffMins === 1) return "Last active 1 minute ago";
  if (diffMins < 60) return `Last active ${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return "Last active 1 hour ago";
  return `Last active ${diffHours} hours ago`;
};

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchReviews();
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

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:5050/api/reviews/${userId}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("❌ Error fetching reviews:", err.message);
    }
  };

  const handleMessageClick = () => {
    setShowMessage(true);
  };

  const renderAddress = (address) => {
    if (!address) return null;
    let parsed = {};
    try {
      parsed = typeof address === "string" ? JSON.parse(address) : address;
    } catch {
      return null;
    }

    return (
      <>
        {parsed.street && <p>Street: {parsed.street}</p>}
        {parsed.barangay && <p>Barangay: {parsed.barangay}</p>}
        {parsed.city && <p>City: {parsed.city}</p>}
        {parsed.province && <p>Province: {parsed.province}</p>}
        {parsed.zipCode && <p>ZIP Code: {parsed.zipCode}</p>}
      </>
    );
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser._id === userId) return;

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5050/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer: currentUser._id,
          reviewedUser: userId,
          rating,
          comment,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (err) {
      console.error("❌ Submit review error:", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D4E8DB] p-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center bg-[#6A8C73] text-white px-6 py-2 rounded-2xl shadow-md hover:bg-[#285236] transition"
        >
          <HiArrowLeft className="text-xl" />
        </button>

        {loading ? (
          <div className="text-gray-600 animate-pulse">Loading user...</div>
        ) : error ? (
          <div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <img
                src={
                  user.profileImage && user.profileImage !== "null" && user.profileImage !== ""
                    ? user.profileImage
                    : "/assets/Profile.jpg"
                }
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/Profile.jpg";
                }}
                referrerPolicy="no-referrer"
                alt="Profile"
                className="w-32 h-32 rounded-full border border-gray-300 mb-3 object-cover"
              />

              <h1 className="text-3xl font-bold text-[#285236] mb-1">{user.name}</h1>
              <p className="text-gray-500 italic mb-1">{getLastActiveLabel(user.lastActive)}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>

            <div className="mb-6 space-y-1 text-sm text-gray-700">
              <p><strong>User ID:</strong> {user._id}</p>
              {user.gender && <p><strong>Gender:</strong> {user.gender}</p>}
              {user.occupation && <p><strong>Occupation:</strong> {user.occupation}</p>}
              {user.sourceOfFunds && <p><strong>Source of Funds:</strong> {user.sourceOfFunds}</p>}
              {user.nationalIdNumber && <p><strong>National ID Number:</strong> {user.nationalIdNumber}</p>}
              {renderAddress(user.address)}
            </div>

            <button
              onClick={handleMessageClick}
              className="px-6 py-3 bg-[#3A6953] hover:bg-[#285236] text-white rounded-full text-lg mb-6"
            >
              Message
            </button>

            {/* REVIEW FORM */}
            {currentUser && currentUser._id !== userId && (
              <form onSubmit={submitReview} className="border-t pt-6 mt-6 mb-10">
                <h2 className="text-xl font-semibold mb-2">Leave a Review</h2>
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Rating</label>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-3xl cursor-pointer ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Comment</label>
                  <textarea
                    className="border p-2 rounded w-full"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#285236] text-white rounded hover:bg-[#1f3c2a]"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            {/* REVIEWS LIST */}
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">User Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet.</p>
              ) : (
                reviews.map((review, idx) => (
                  <div key={idx} className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="font-bold">{review.reviewer.name}</p>
                    <p className="text-yellow-500 text-lg">
                      {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                    </p>
                    <p className="text-gray-800">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Replace the old MessageUser panel with the new SideMessageModal */}
      <SideMessageModal
        isOpen={showMessage}
        onClose={() => setShowMessage(false)}
        recipientId={userId}
        recipientName={user?.name}
      />
    </div>
  );
};

export default UserProfile;
