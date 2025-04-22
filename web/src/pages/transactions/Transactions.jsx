import { useEffect, useState } from "react";
import { exportToCSV } from "../../../utils/exportToCSV";
import { IoIosSearch } from "react-icons/io";

const Transactions = () => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(""); // 🌟 added
  const [selectedYear, setSelectedYear] = useState("");   // 🌟 added

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    fetch(`http://localhost:5050/api/wallet/transactions?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setTransactions(data || []))
      .catch((err) => console.error("Error fetching transactions:", err));
  }, []);

  const months = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = [""]; // blank option first
  for (let year = 2020; year <= currentYear; year++) {
    years.push(year.toString());
  }
  
  const filteredTransactions = transactions.filter((txn) => {
    const txnDate = new Date(txn.timestamp);

    const searchMatch =
      txn.type?.toLowerCase().includes(search.toLowerCase()) ||
      txn.referenceId?.toLowerCase().includes(search.toLowerCase()) ||
      (txn.metadata?.channel || "").toLowerCase().includes(search.toLowerCase());

    const dateMatch =
      !dateFilter ||
      txnDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) === new Date(dateFilter).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    const monthMatch =
      !selectedMonth || txnDate.toLocaleString('default', { month: 'long' }) === selectedMonth;

    const yearMatch =
      !selectedYear || txnDate.getFullYear().toString() === selectedYear;

    return searchMatch && dateMatch && monthMatch && yearMatch;
  });

  const handleDownload = () => {
    if (!selectedMonth && !selectedYear) {
      alert("Please select month and/or year before downloading.");
      return;
    }
    exportToCSV(filteredTransactions);
  };

  return (
    <div className="sm:ml-[90px] col-span-2 p-2">
      <h1 className="text-4xl font-bold text-[#285236] mb-2">Transaction History</h1>
      <p className="text-[#6A8C73] font-normal mb-6">
        Here’s your transaction of your Paluwagan today.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <div className="relative w-full sm:w-1/3">
            <IoIosSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Quick Search..."
              className="border border-gray-300 rounded-lg pl-10 p-2 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              className="border border-gray-300 rounded-lg p-2"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((month, index) => (
                <option key={index} value={month}>{month || "Select Month"}</option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded-lg p-2"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((year, index) => (
                <option key={index} value={year}>{year || "Select Year"}</option>
              ))}
            </select>

            <button
              className="bg-[#6A8C73] text-white rounded-lg px-4 py-2"
              onClick={handleDownload}
            >
              Download Transactions
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3 text-left">Transaction ID</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Details</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-gray-400 py-4">
                    No transactions found.
                  </td>
                </tr>
              )}
              {filteredTransactions.map((txn, index) => {
                const dateObj = new Date(txn.timestamp);
                const date = dateObj.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const time = dateObj.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={index} className="border-t">
                    <td className="p-3">{txn.referenceId}</td>
                    <td className="p-3 capitalize">{txn.type}</td>
                    <td className="p-3">
                      {txn.metadata?.to
                        ? `To: ${txn.metadata.to}`
                        : txn.metadata?.from
                        ? `From: ${txn.metadata.from}`
                        : txn.metadata?.mobileNumber
                        ? `Mobile: ${txn.metadata.mobileNumber}`
                        : txn.metadata?.channel
                        ? txn.metadata.channel
                        : "-"}
                    </td>
                    <td className="p-3">{date}</td>
                    <td className="p-3">{time.toLowerCase()}</td>
                    <td className="p-3">₱{txn.amount.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm ${
                          txn.type === "deposit"
                            ? "bg-[#EAE8C3] text-[#85830F]"
                            : txn.type === "withdraw"
                            ? "bg-[#D4E8DB] text-[#3A6953]"
                            : "bg-[#E6EFFC] text-[#0764E6]"
                        }`}
                      >
                        {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-gray-500 text-sm mt-4">Page 1 of 1</div>
      </div>
    </div>
  );
};

export default Transactions;
