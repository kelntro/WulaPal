import { useState } from "react";

const Notifications = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [notifications] = useState([
    { id: 1, message: "Success Created a Paluwagan Group", date: "2023-07-29" },
    { id: 2, message: "Success Created a Paluwagan Group", date: "2023-07-28" },
    { id: 3, message: "Success Created a Paluwagan Group", date: "2023-07-29" },
    { id: 4, message: "Success Created a Paluwagan Group", date: "2023-07-27" },
    { id: 5, message: "Success Created a Paluwagan Group", date: "2023-07-29" },
    { id: 6, message: "Success Created a Paluwagan Group", date: "2023-07-28" },
    { id: 7, message: "Success Created a Paluwagan Group", date: "14/06/21" },
    { id: 8, message: "Success Created a Paluwagan Group", date: "14/06/21" },
  ]);

  // Filter notifications based on the selected date
  const filteredNotifications = selectedDate
    ? notifications.filter((item) => item.date === selectedDate)
    : notifications;

  return (
    <div className="sm:ml-[90px] col-span-2 p-2">
      {/* Header */}
      <h1 className="text-4xl font-bold text-[#285236] mb-2">Notifications</h1>
      <p className="text-[#6A8C73] font-normal mb-6">
        Here’s your activity for today.
      </p>

      {/* Card Container */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Date Filter */}
        <div className="flex justify-end items-center mb-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg text-gray-600"
          />
        </div>

        {/* Notification List */}
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-3">
                {/* Left Side (Icon + Text) */}
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
                    <p className="text-[#285236] font-semibold">{item.message}</p>
                    <p className="text-sm text-gray-500">
                      See the schedule of your group.
                    </p>
                  </div>
                </div>
                {/* Right Side (Date) */}
                <p className="text-sm text-gray-500">{item.date}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No notifications for this date.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
