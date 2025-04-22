"use client";

import { useState, useEffect, useContext } from "react";
import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { PieChart } from "@mui/x-charts/PieChart";
import { GoArrowDownLeft, GoArrowUpRight } from "react-icons/go";
import { HiChevronRight } from "react-icons/hi";
import { MessageCircle } from "lucide-react";
import { UserContext } from "../../context/UserContext.jsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const AccountBalanceCard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0); // 🔵 Add balance state

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`http://localhost:5050/api/wallet/balance?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.balance !== undefined) {
            console.log("✅ [Balance] Fetched:", data.balance);
            setBalance(data.balance);
          } else {
            console.warn("⚠️ [Balance] Unexpected response:", data);
          }
        })
        .catch((err) => {
          console.error("❌ [Balance] Error fetching balance:", err);
        });
    } else {
      console.warn("⚠️ [Balance] userId not found in localStorage.");
    }
  }, []);

  return (
    <div className="w-[375px] bg-white rounded-[20px] shadow-md p-6">
      <h2 className="text-[#3a6953] text-[22px] font-bold">Account Balance</h2>
      <p className="text-[#6A8C73] text-sm mt-2">
        Here’s your remaining balance
      </p>

      <div className="w-full h-[150px] mt-4 rounded-[20px] bg-gradient-to-b from-[#99c6a9] to-[#6a8c73] flex flex-col justify-center p-6">
        <span className="text-white text-sm">Current Balance</span>
        <span className="text-white text-3xl font-semibold">
          ₱{balance.toLocaleString()}
        </span>
      </div>

      <button
        className="w-full mt-4 h-10 rounded-[10px] border border-[#6a8c73] text-[#3a6953] text-xs font-normal"
        onClick={() => navigate("/wallet")}
      >
        View more
      </button>
    </div>
  );
};

const GroupSlotsCard = () => {
  const navigate = useNavigate();
  const [slotsData, setSlotsData] = useState({
    unavailable: 0,
    available: 0,
    empty: 0,
  });

  useEffect(() => {
    const fetchGroupSlots = async () => {
      const organizerId = localStorage.getItem("userId");

      if (!organizerId) {
        console.warn("⚠️ No organizerId in localStorage");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5050/api/organizer-groups?organizerId=${organizerId}`
        );
        const groups = await res.json();

        console.log("📥 [GroupSlots] Groups fetched:", groups);

        let unavailable = 0;
        let available = 0;
        let empty = 0;

        groups.forEach((group) => {
          const required = group.requiredMembers || 0;
          const joined = group.members.length || 0;
          const remainingSlots = required - joined;

          if (joined === 0) {
            empty += required;
          } else if (remainingSlots > 0) {
            available += remainingSlots;
            unavailable += joined;
          } else {
            unavailable += required;
          }
        });

        console.log(
          `✅ [GroupSlots] Calculated ➔ Unavailable: ${unavailable}, Available: ${available}, Empty: ${empty}`
        );

        setSlotsData({ unavailable, available, empty });
      } catch (err) {
        console.error("❌ [GroupSlots] Error fetching groups:", err.message);
      }
    };

    fetchGroupSlots();
  }, []);

  return (
    <div className="w-[375px] bg-white rounded-3xl shadow-md p-6 mt-6">
      <div className="flex justify-between items-center">
        <h1 className="text-[#3a6953] text-[22px] font-bold">Group Slots</h1>
        <button
          className="flex gap-1 px-2 py-2 text-xs text-white rounded-xl bg-[#89A598]"
          onClick={() => navigate("/purchase/subscription")}
        >
          Get more slots <HiChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="relative flex justify-center mt-[30px]">
        <PieChart
          width={200}
          height={150}
          series={[
            {
              data: [
                { id: 1, value: slotsData.unavailable, color: "#285236" },
                { id: 2, value: slotsData.available, color: "#99c6a9" },
                { id: 3, value: slotsData.empty, color: "#BFFFE4" },
              ],
              innerRadius: 40,
              outerRadius: 105,
              paddingAngle: 1,
              cornerRadius: 5,
              startAngle: -90,
              endAngle: 90,
              cx: 100,
              cy: 100,
            },
          ]}
        />
      </div>

      <div className="flex flex-col mt-[-10px] text-[#285236] space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#285236] rounded-full" />
            <span className="text-sm">Unavailable Slots</span>
          </div>
          <p className="text-lg font-medium">{slotsData.unavailable}</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#99c6a9] rounded-full" />
            <span className="text-sm">Available Slots</span>
          </div>
          <p className="text-lg font-medium">{slotsData.available}</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#BFFFE4] rounded-full" />
            <span className="text-sm">Empty Slots</span>
          </div>
          <p className="text-lg font-medium">{slotsData.empty}</p>
        </div>
      </div>

      <button
        className="w-full mt-6 py-3 bg-[#D4E8DB] text-[#3A6953] border border-[#6a8c73] rounded-xl text-base font-medium"
        onClick={() => navigate("/manage-group/paluwagan-groups")}
      >
        View all Paluwagan groups
      </button>
    </div>
  );
};

const AnalyticsChart = () => {
  const [data, setData] = useState([]);
  const [viewType, setViewType] = useState("monthly"); // monthly or yearly
  const [rawTransactions, setRawTransactions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (rawTransactions.length > 0) {
      processChartData();
    }
  }, [viewType, rawTransactions]);

  const fetchData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("⚠️ No userId found in localStorage");
      return;
    }

    try {
      console.log("🔵 Fetching transactions for user:", userId);
      const res = await fetch(
        `http://localhost:5050/api/wallet/transactions?userId=${userId}`
      );
      const transactions = await res.json();
      console.log("📥 [AnalyticsChart] Raw Transactions:", transactions);
      setRawTransactions(transactions);
    } catch (err) {
      console.error("❌ Error fetching transactions:", err.message);
    }
  };

  const processChartData = () => {
    console.log(`⚡ Processing transactions for view: ${viewType}`);

    if (viewType === "monthly") {
      const monthlyData = Array.from({ length: 12 }, (_, index) => ({
        month: new Date(0, index).toLocaleString("default", { month: "short" }),
        deposit: 0,
        withdraw: 0,
        transfer: 0,
        receive: 0,
      }));

      rawTransactions.forEach((txn) => {
        const date = new Date(txn.timestamp);
        const month = date.getMonth();
        console.log(
          `📅 [Monthly] Transaction:`,
          txn.type,
          "→",
          txn.amount,
          "Month:",
          month
        );

        if (txn.type === "deposit") {
          monthlyData[month].deposit += txn.amount;
        }
        if (txn.type === "withdraw") {
          monthlyData[month].withdraw += txn.amount;
        }
        if (txn.type === "transfer") {
          monthlyData[month].transfer += txn.amount;
        }
        if (txn.type === "receive") {
          monthlyData[month].receive += txn.amount;
        }
      });

      console.log("✅ Processed Monthly Data:", monthlyData);
      setData(monthlyData);
    } else if (viewType === "yearly") {
      const yearlyDataMap = {};

      rawTransactions.forEach((txn) => {
        const date = new Date(txn.timestamp);
        const year = date.getFullYear();
        console.log(
          `📅 [Yearly] Transaction:`,
          txn.type,
          "→",
          txn.amount,
          "Year:",
          year
        );

        if (!yearlyDataMap[year]) {
          yearlyDataMap[year] = {
            year,
            deposit: 0,
            withdraw: 0,
            transfer: 0,
            receive: 0,
          };
        }
        if (txn.type === "deposit") {
          yearlyDataMap[year].deposit += txn.amount;
        }
        if (txn.type === "withdraw") {
          yearlyDataMap[year].withdraw += txn.amount;
        }
        if (txn.type === "transfer") {
          yearlyDataMap[year].transfer += txn.amount;
        }
        if (txn.type === "receive") {
          yearlyDataMap[year].receive += txn.amount;
        }
      });

      const yearlyData = Object.values(yearlyDataMap).sort(
        (a, b) => a.year - b.year
      );
      console.log("✅ Processed Yearly Data:", yearlyData);
      setData(yearlyData);
    }
  };

  return (
    <div className="w-[758px] bg-white rounded-[20px] shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#3A6953] text-[26px] font-bold">Analytics</h2>
        <div className="relative">
          <select
            className="appearance-none border border-[#99C6A9] pl-4 pr-10 py-2 rounded-full text-[15px] font-medium focus:outline-none"
            value={viewType}
            onChange={(e) => {
              console.log(`🌀 View changed to: ${e.target.value}`);
              setViewType(e.target.value);
            }}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <svg
  className="w-4 h-4 text-[#3a6953]"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <polyline points="6 9 12 15 18 9" />
</svg>

          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={viewType === "monthly" ? "month" : "year"} />
          <YAxis tickFormatter={(value) => `₱${(value / 1000).toFixed(1)}K`} />
          <Tooltip
            formatter={(value) => `₱${Number(value).toLocaleString()}`}
          />
          <Legend />
          <Bar
            dataKey="deposit"
            fill="#3A6953"
            barSize={10}
            name="Deposit"
            radius={[10, 10, 0, 0]}
          />
          <Bar
            dataKey="withdraw"
            fill="#9B2C2C"
            barSize={10}
            name="Withdraw"
            radius={[10, 10, 0, 0]}
          />
          <Bar
            dataKey="transfer"
            fill="#FF9AA2"
            barSize={10}
            name="Transfer"
            radius={[10, 10, 0, 0]}
          />
          <Bar
            dataKey="receive"
            fill="#7FC8A9"
            barSize={10}
            name="Receive"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const RecentTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.warn("⚠️ No userId found in localStorage.");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5050/api/wallet/transactions?userId=${userId}`
        );
        const data = await res.json();

        console.log("📥 [RecentTransactions] Transactions fetched:", data);
        setTransactions(data.slice(0, 5)); // Only show latest 5 transactions
      } catch (error) {
        console.error(
          "❌ [RecentTransactions] Error fetching transactions:",
          error.message
        );
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="w-[758px] bg-white rounded-[20px] shadow-md p-6 mt-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#3A6953] text-[26px] font-bold">
          Recent Transactions
        </h2>
        <button
          className="bg-[#89A598] text-white px-4 py-2 rounded-lg hover:bg-[#D4E8DB] transition"
          onClick={() => navigate("/transactions")}
        >
          View More
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="pb-3">About</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, index) => (
              <tr key={index} className="border-b last:border-none">
                <td className="py-3">
                  {txn.type === "deposit" && "Wallet Deposit"}
                  {txn.type === "withdraw" && "Wallet Withdrawal"}
                  {txn.type === "transfer" && "Fund Transfer"}
                  {txn.type === "receive" && "Fund Received"}
                </td>
                <td className="py-3">{formatDate(txn.timestamp)}</td>
                <td className="py-3">₱{Number(txn.amount).toLocaleString()}</td>
                <td className="py-3">
                  <span className="bg-[#EAE8C3] text-[#85830F] px-3 py-1 rounded-full text-sm">
                    {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-5 text-gray-400">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [totalWithdraw, setTotalWithdraw] = useState(0);
  const [groupCounts, setGroupCounts] = useState({
    open: 0,
    active: 0,
    completed: 0,
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  useEffect(() => {
    fetchWalletSummary();
    fetchGroupSummary();
  }, []);

  const fetchWalletSummary = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await fetch(
        `http://localhost:5050/api/wallet/transactions?userId=${userId}`
      );
      const transactions = await res.json();

      let deposit = 0;
      let withdraw = 0;

      transactions.forEach((txn) => {
        if (txn.type === "deposit") deposit += txn.amount;
        if (txn.type === "withdraw") withdraw += txn.amount;
      });

      setTotalDeposit(deposit);
      setTotalWithdraw(withdraw);
    } catch (err) {
      console.error("❌ Error fetching wallet summary:", err.message);
    }
  };

  const fetchGroupSummary = async () => {
    const organizerId = localStorage.getItem("userId");
    if (!organizerId) return;

    try {
      const res = await fetch(
        `http://localhost:5050/api/organizer-groups?organizerId=${organizerId}`
      );
      const groups = await res.json();

      let open = 0;
      let active = 0;
      let completed = 0;

      groups.forEach((group) => {
        if (group.status === "open") open += 1;
        else if (group.status === "active") active += 1;
        else if (group.status === "completed") completed += 1;
      });

      setGroupCounts({ open, active, completed });
    } catch (err) {
      console.error("❌ Error fetching group summary:", err.message);
    }
  };

  const handleSearch = async (query) => {
    if (!query) return;

    try {
      const res = await fetch(
        `http://localhost:5050/api/users/search?q=${query}`
      );
      const users = await res.json();
      console.log("🔍 Search Results:", users);
      // 👉 You can either navigate to a search results page
      // or temporarily display results in a modal, toast, etc.
    } catch (err) {
      console.error("❌ Error searching users:", err.message);
    }
  };

  return (
    <div className="p-2 flex justify-center">
      <div className="grid grid-cols-3 gap-8 max-w-[1500px]">
        {/* Floating Chat Button */}
        <button
          onClick={() => navigate("/groupchats")}
          className="fixed bottom-6 right-6 bg-[#3A6953] hover:bg-[#285236] text-white p-4 rounded-full shadow-lg z-50"
          title="Group Chats"
        >
          <MessageCircle size={24} />
        </button>

        <div className="ml-[20px] col-span-2">
          <h1 className="text-4xl font-bold text-[#285236] mb-2">
            Welcome Back, {user?.name?.split(" ")[0] || "Organizer"}
          </h1>
          <p className="text-[#6A8C73] font-normal mb-6">
            Here’s what’s happening with your Paluwagan today.
          </p>

          <div className="grid grid-cols-3 gap-6">
            {/* Total Deposit */}
            <div className="w-full bg-white rounded-[20px] shadow-md p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-[45px] h-[45px] flex items-center justify-center bg-[#6a8c73] rounded-[10px]">
                  <GoArrowDownLeft className="w-5 h-5 text-white" />
                </div>
                <div className="ml-5">
                  <div className="text-[#285236] text-base font-normal">
                    Total Deposit
                  </div>
                  <div className="text-[#3a6953] text-2xl font-normal">
                    ₱{totalDeposit.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Withdraw */}
            <div className="w-full bg-white rounded-[20px] shadow-md p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-[45px] h-[45px] flex items-center justify-center bg-[#6a8c73] rounded-[10px]">
                  <GoArrowUpRight className="w-5 h-5 text-white" />
                </div>
                <div className="ml-5">
                  <div className="text-[#285236] text-base font-normal">
                    Total Withdraw
                  </div>
                  <div className="text-[#3a6953] text-2xl font-normal">
                    ₱{totalWithdraw.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Number of Active Groups */}
            <div className="w-full bg-white rounded-[20px] shadow-md p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-[45px] h-[45px] flex items-center justify-center bg-[#6a8c73] rounded-[10px]">
                  <HiChevronRight className="w-5 h-5 text-white" />
                </div>
                <div className="ml-5">
                  <div className="text-[#285236] text-base font-normal">
                    Active Groups
                  </div>
                  <div className="text-[#3a6953] text-2xl font-normal">
                    {groupCounts.active}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics and Recent Transactions */}
          <AnalyticsChart />
          <RecentTransactions />
        </div>

        {/* Sidebar */}
        {/* Sidebar */}
        <div className="mt-6 flex flex-col items-center">
          {/* Search Box at the Top of Sidebar */}
          <div className="relative w-[375px]">
  {/* Search Icon */}
  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
    <svg
      className="w-5 h-5 text-[#6A8C73]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2.35a7.5 7.5 0 010 14.3z" />
    </svg>
  </div>

  {/* Search Input */}
  <input
    type="text"
    placeholder="Search users by name, email, or ID..."
    className="w-full border border-[#99C6A9] rounded-full pl-12 pr-4 py-2 text-sm focus:outline-none"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyDown={handleKeyDown}
  />
</div>


          {/* Then Account Balance */}
          <div className="mt-8">
            <AccountBalanceCard />
          </div>

          {/* Then Group Slots */}
          <GroupSlotsCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
