import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { LuMailbox } from "react-icons/lu";
import { HiArrowLeft } from "react-icons/hi";
import { IoPersonSharp } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 ${
        type === 'success' ? 'bg-green-50 border border-green-200' : 
        type === 'error' ? 'bg-red-50 border border-red-200' : 
        'bg-green-50 border border-green-200'
      }`}>
        <span className={`text-xl ${
          type === 'success' ? 'text-green-600' : 
          type === 'error' ? 'text-red-600' : 
          'text-green-600'
        }`}>
          {type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}
        </span>
        <p className={`font-medium ${
          type === 'success' ? 'text-green-800' : 
          type === 'error' ? 'text-red-800' : 
          'text-green-800'
        }`}>
          {message}
        </p>
      </div>
    </div>
  );
};

const JoinRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5050/api/organizer/join-requests/${user._id}`);
        const data = await res.json();
        setRequests(data);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to load join requests:", err.message);
        setError("Failed to load join requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchRequests();
  }, [user]);

  const handleAction = async (action, req) => {
    try {
      setProcessingId(req._id);
      const endpoint = action === 'approve' 
        ? `http://localhost:5050/api/groups/${req.groupId}/approve-request`
        : `http://localhost:5050/api/groups/${req.groupId}/decline-request`;
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: req.userId }),
      });
      
      const data = await res.json();
      setRequests((prev) => prev.filter((r) => r._id !== req._id));
      showToast(data.message || (action === 'approve' ? "Request approved" : "Request declined"), 'success');
    } catch (err) {
      console.error(`❌ ${action} failed:`, err);
      showToast(`Failed to ${action} request`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-red-200 text-red-700 px-8 py-6 rounded-lg shadow-sm max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">⚠️</span>
            <h3 className="text-lg font-semibold">Error Loading Requests</h3>
          </div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center bg-[#6A8C73] text-white px-6 py-2 rounded-2xl shadow-md hover:bg-[#285236] transition"
                >
                  <HiArrowLeft className="text-xl" />
                </button>
                <h2 className="text-xl font-bold text-[#3A6953] flex items-center">
                  Pending Join Requests
                </h2>
              </div>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                {requests.length} {requests.length === 1 ? 'Request' : 'Requests'}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {requests.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex justify-center">
                  <div className="text-6xl mb-4 animate-bounce text-[#3A6953]">
                    <LuMailbox />
                  </div>
                </div>
                <p className="text-gray-500 text-lg font-medium">No pending requests found</p>
                <p className="text-gray-400 mt-2">Check back later for new join requests</p>
              </div>
            ) : (
              requests.map((req) => (
                <div 
                  key={req._id} 
                  className="p-6 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.01]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-700 text-lg mb-2">
                        <span className="mr-2"><HiOutlineSpeakerphone className="text-white" /></span>
                        {req.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        Requested by user ID: {req.userId}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                      onClick={() => navigate(`/user/${req.userId}`)}
                      disabled={processingId === req._id}
                    >
                      <span className="mr-2"><IoPersonSharp className="text-white" /></span>
                      View Profile
                    </button>
                    
                    <button
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                      onClick={async () => {
                        try {
                          await handleAction('approve', req);
                        } catch (err) {}
                      }}
                      disabled={processingId === req._id}
                    >
                      {processingId === req._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">✓</span>
                          Approve & Notify
                        </>
                      )}
                    </button>
                    
                    <button
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                      onClick={async () => {
                        try {
                          await handleAction('decline', req);
                        } catch (err) {}
                      }}
                      disabled={processingId === req._id}
                    >
                      {processingId === req._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">✕</span>
                          Decline
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRequests;
