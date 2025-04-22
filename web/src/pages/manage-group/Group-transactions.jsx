import { useState, useEffect } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { IoIosSearch } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const GroupTransactions = () => {
  const navigate = useNavigate();
  const { groupId } = useParams(); // ⬅️ Get groupId from URL

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
        const res = await axios.get(`http://localhost:5050/api/group-transactions/${groupId}`);
        console.log("✅ Transactions fetched successfully:", res.data);

        setTransactions(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch transactions:", err.message);
      }
    };

    if (groupId) {
      fetchTransactions();
    } else {
      console.warn("⚠️ No groupId provided, skipping fetch.");
    }
  }, [groupId]);

  const filteredTransactions = transactions.filter(
    (txn) =>
      (txn.name?.toLowerCase()?.includes(search.toLowerCase()) ||
      txn.contributed?.toLowerCase()?.includes(search.toLowerCase()) ||
      txn.status?.toLowerCase()?.includes(search.toLowerCase())) &&
      (dateFilter === "" || txn.date === dateFilter)
  );

  console.log("🔎 Current search term:", search);
  console.log("📅 Current date filter:", dateFilter);
  console.log("🗃️ Filtered Transactions:", filteredTransactions);

  return (
    <div className="col-span-2 p-2">
      <div className="p-2 ">
        {/* Search & Controls */}
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
          <div className="flex gap-2 items-center">
            <input
              type="date"
              className="border border-gray-300 rounded-lg p-2"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <button className="bg-[#6A8C73] text-white rounded-lg px-4 py-2">
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
        <span className="text-sm">Once contributions or payouts happen, they'll appear here automatically.</span>
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
              txn.status === "Deposit"
                ? "bg-[#EAE8C3] text-[#85830F]"
                : txn.status === "Withdrawal"
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

        {/* Pagination */}
        <div className="text-gray-500 text-sm mt-4">Page 1 of 1</div>
      </div>
    </div>
  );
};

export default GroupTransactions;
