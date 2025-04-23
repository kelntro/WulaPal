import { useState, useEffect } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { IoIosSearch } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const GroupTransactions = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();

  console.log("📥 GroupTransactions Loaded. groupId:", groupId);

  return (
    <div className="transition-all duration-300 w-[1150px] mx-auto bg-white p-4 rounded-lg shadow-md">
      <div className="w-full max-w-8xl p-2 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center bg-[#6A8C73] text-white px-6 py-2 rounded-2xl shadow-md hover:bg-[#285236] transition"
        >
          <HiArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-semibold text-[#285236] ml-4">
          Group Transactions
        </h1>
      </div>
      <Transactions groupId={groupId} />
    </div>
  );
};

const Transactions = ({ groupId }) => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      console.log("📡 Fetching transactions for groupId:", groupId);
      try {
        const res = await axios.get(
          `http://localhost:5050/api/group-transactions/${groupId}`
        );
        console.log("✅ Transactions fetched successfully:", res.data);
        setTransactions(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch transactions:", err.message);
      }
    };

    if (groupId) fetchTransactions();
  }, [groupId]);

  const formatToYMD = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return ""; // 👈 Skip if missing
    const combined = new Date(`${dateStr} ${timeStr}`);
    if (isNaN(combined)) {
      console.warn("⚠️ Invalid date/time:", dateStr, timeStr);
      return "";
    }
    return combined.toISOString().split("T")[0];
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchSearch =
      txn.name?.toLowerCase().includes(search.toLowerCase()) ||
      txn.contributed?.toLowerCase().includes(search.toLowerCase()) ||
      txn.status?.toLowerCase().includes(search.toLowerCase());

    const matchDate =
      dateFilter === "" || formatToYMD(txn.date, txn.time) === dateFilter;

    return matchSearch && matchDate;
  });

  console.log("🔎 Search:", search);
  console.log("📅 Date Filter:", dateFilter);
  console.log("🗃️ Filtered Transactions:", filteredTransactions);

  const downloadCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("⚠️ No transactions to download.");
      return;
    }

    const headers = [
      "Transaction ID",
      "Name",
      "Contributed",
      "Date",
      "Time",
      "Status",
    ];
    const rows = filteredTransactions.map((txn) => [
      txn.id,
      txn.name,
      txn.contributed,
      txn.date,
      txn.time,
      txn.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${groupId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="col-span-2 p-2">
      <div className="p-2">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
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
          <div className="flex gap-2 items-center mt-2 sm:mt-0">
            <input
              type="date"
              className="border border-gray-300 rounded-lg p-2"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <button
              onClick={downloadCSV}
              className="bg-[#6A8C73] text-white rounded-lg px-4 py-2 hover:bg-[#285236] transition"
            >
              Download Transaction
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3 text-left">Transaction ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Contributed to</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    📭 No transactions yet for this group.
                    <br />
                    <span className="text-sm">
                      Once contributions or payouts happen, they'll appear here
                      automatically.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{txn.id}</td>
                    <td className="p-3">{txn.name}</td>
                    <td className="p-3">{txn.contributed}</td>
                    <td className="p-3">{txn.date}</td>
                    <td className="p-3">{txn.time}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm ${
                          txn.status === "Contribution"
                            ? "bg-[#EAE8C3] text-[#85830F]"
                            : txn.status === "Payout"
                            ? "bg-[#D4E8DB] text-[#3A6953]"
                            : "bg-[#E6EFFC] text-[#0764E6]"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="text-gray-500 text-sm mt-4">Page 1 of 1</div>
      </div>
    </div>
  );
};

export default GroupTransactions;
