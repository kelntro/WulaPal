import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { FiTrash2 } from "react-icons/fi";

const SERVER_URL = "http://192.168.56.1:5050";
const socket = io(SERVER_URL);

const Notifications = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [organizerId, setOrganizerId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notifToDelete, setNotifToDelete] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser._id) {
      setOrganizerId(storedUser._id);
    } else {
      console.error("❌ Organizer ID not found!");
    }
  }, []);

  useEffect(() => {
    if (!organizerId) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${SERVER_URL}/api/notifications/${organizerId}`
        );
        const formatted = res.data.map((n) => ({
          id: n._id,
          message: n.message,
          type: n.type, // ✅ include type
          userId: n.userId, // ✅ include userId
          groupId: n.groupId,
          date: new Date(n.date).toISOString().split("T")[0],
          rawDate: n.date,
          read: n.read,
        }));
        setNotifications(formatted);
      } catch (err) {
        console.error("❌ Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
  }, [organizerId]);

  useEffect(() => {
    if (!organizerId) return;

    const handleNew = (notif) => {
      if (notif.organizerId?.toString() === organizerId.toString()) {
        setNotifications((prev) => [
          {
            id: notif._id || Date.now(),
            message: notif.message,
            date: new Date(notif.date).toISOString().split("T")[0],
            rawDate: notif.date,
            read: notif.read || false,
          },
          ...prev,
        ]);
      }
    };

    socket.on("newGroup", handleNew);
    socket.on("groupUpdated", handleNew);

    return () => {
      socket.off("newGroup", handleNew);
      socket.off("groupUpdated", handleNew);
    };
  }, [organizerId]);

  const markAsRead = async (notifId) => {
    await axios.patch(`${SERVER_URL}/api/notifications/${notifId}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const confirmDelete = (notif) => {
    setNotifToDelete(notif);
    setShowDeleteConfirm(true);
  };

  const deleteNotification = async () => {
    if (!notifToDelete) return;
    await axios.delete(`${SERVER_URL}/api/notifications/${notifToDelete.id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== notifToDelete.id));
    setShowDeleteConfirm(false);
    setNotifToDelete(null);
  };

  const openNotification = async (notif) => {
    await markAsRead(notif.id);
    setSelectedNotif(notif);
  };

  const filteredNotifications = selectedDate
    ? notifications.filter((n) => n.date === selectedDate)
    : notifications;

  return (
    <div className="sm:ml-[90px] col-span-2 p-2">
      <h1 className="text-4xl font-bold text-[#285236] mb-2">Notifications</h1>
      <p className="text-[#6A8C73] font-normal mb-6">
        Here’s your notifications.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-end items-center mb-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg text-gray-600"
          />
        </div>

        <div className="divide-y divide-gray-200">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => openNotification(item)}
                className={`flex justify-between items-center py-3 cursor-pointer ${
                  item.read ? "bg-gray-50" : "bg-green-100"
                } hover:bg-green-200 transition`}
              >
                <div className="flex items-center">
                  <span className="bg-[#A8C7A1] p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 2a6 6 0 00-6 6v5H1a1 1 0 000 2h18a1 1 0 000-2h-1V8a6 6 0 00-6-6H8zM5 8a3 3 0 016 0v5H5V8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[#285236] font-semibold">
                      {item.message}
                    </p>
                    <p className="text-sm text-gray-500">
                      See the schedule of your group.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-500">{item.date}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(item);
                    }}
                    className="text-red-500 hover:text-red-700 text-lg"
                    title="Delete notification"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No notifications for this date.
            </p>
          )}
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotif &&
        (selectedNotif.type === "member_invite" ? (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full text-center">
              <h2 className="text-xl font-bold text-[#285236] mb-2">
                Group Invitation
              </h2>
              <p className="mb-4 text-gray-700">{selectedNotif.message}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={async () => {
                    try {
                      await axios.post(
                        `${SERVER_URL}/api/groups/${selectedNotif.groupId}/confirm-member`,
                        {
                          userId: selectedNotif.userId,
                        }
                      );
                      alert("✅ You have joined the group!");
                      setSelectedNotif(null);
                    } catch (err) {
                      console.error(
                        "❌ Failed to confirm invite:",
                        err.message
                      );
                      alert("❌ Error confirming invitation.");
                    }
                  }}
                  className="px-4 py-2 bg-[#3A6953] text-white rounded hover:bg-[#285236]"
                >
                  Confirm Join
                </button>
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-2 text-[#285236]">
                Notification Details
              </h2>
              <p className="mb-2 text-gray-800">{selectedNotif.message}</p>
              <p className="text-sm text-gray-500">
                Date: {new Date(selectedNotif.rawDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                Time: {new Date(selectedNotif.rawDate).toLocaleTimeString()}
              </p>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="px-4 py-2 bg-[#3A6953] text-white rounded hover:bg-[#285236] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ))}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this notification?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={deleteNotification}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setNotifToDelete(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
