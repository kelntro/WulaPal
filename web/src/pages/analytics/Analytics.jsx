"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  Line,
  PieChart, 
  Pie, 
  Cell,
} from "recharts";

const fetchGroups = async (organizerId) => {
  console.log("🔵 Fetching groups for organizer:", organizerId);
  try {
    const res = await fetch(`http://localhost:5050/api/organizer-groups?organizerId=${organizerId}`);
    const data = await res.json();
    console.log("🟢 Successfully fetched groups:", data);
    return data;
  } catch (error) {
    console.error("🔴 Error fetching groups:", error);
    return [];
  }
};

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const PerformanceOverview = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const organizerId = localStorage.getItem("userId"); // 📦 Replace if you store organizerId differently

    if (organizerId) {
      fetchGroups(organizerId).then(groups => {
        console.log("📊 Processing groups for year:", selectedYear);
        const monthlyData = months.map((month, idx) => ({
          month,
          open: 0,
          active: 0,
          completed: 0,
        }));

        groups.forEach(group => {
          const createdAt = new Date(group.createdAt);
          const year = createdAt.getFullYear();
          const month = createdAt.getMonth();

          if (year === selectedYear) {
            if (group.status && monthlyData[month][group.status] !== undefined) {
              monthlyData[month][group.status]++;
            }
          }
        });

        console.log("✅ Final chart data:", monthlyData);
        setChartData(monthlyData);
      });
    } else {
      console.warn("⚠️ Organizer ID not found in localStorage.");
    }
  }, [selectedYear]);

  return (
    <div className="w-[758px] bg-white rounded-[20px] shadow-md p-7 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#3A6953] text-[26px] font-bold">Group Performance Overview</h2>
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="appearance-none border border-[#99C6A9] pl-4 pr-10 py-2 rounded-full text-[15px] font-medium focus:outline-none"
          >
          {Array.from({ length: 6 }, (_, i) => {
            const year = new Date().getFullYear() + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}

          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[#3a6953]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="open" fill="#FFD700" name="Open" barSize={10} radius={[10, 10, 0, 0]} />
          <Bar dataKey="active" fill="#7FC8A9" name="Active" barSize={10} radius={[10, 10, 0, 0]} />
          <Bar dataKey="completed" fill="#6A8C73" name="Completed" barSize={10} radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const fetchIncomeData = async (organizerId) => {
  console.log("🔵 Fetching income data for organizer:", organizerId);
  try {
    const res = await fetch(`http://localhost:5050/api/organizer-groups?organizerId=${organizerId}`); // ✅ FIXED
    const groups = await res.json();
    console.log("📥 [IncomeFlow] Raw groups fetched:", groups);

    const monthlyData = months.map((month) => ({
      month,
      income: 0,
      transferred: 0,
    }));

    groups.forEach((group) => {
      const createdAt = new Date(group.createdAt);
      const year = createdAt.getFullYear();
      const monthIdx = createdAt.getMonth(); // 0 = Jan

      if (year === new Date().getFullYear()) {
        const contributionAmount = parseFloat(group.contributionAmount) || 0;
        const membersCount = group.members.length || 0;

        // 💵 Organizer earns when members contribute
        monthlyData[monthIdx].income += contributionAmount * membersCount;

        // 💸 Organizer pays out when group is active/completed
        if (group.status === "active" || group.status === "completed") {
          monthlyData[monthIdx].transferred += contributionAmount * (membersCount - 1);
          // -1 because payout recipient does not contribute
        }
      }
    });

    console.log("✅ [IncomeFlow] Final monthly data:", monthlyData);
    return monthlyData;
  } catch (error) {
    console.error("❌ [IncomeFlow] Error fetching income data:", error);
    return months.map((month) => ({ month, income: 0, transferred: 0 }));
  }
};

const IncomeFlowChart = () => {
  const [selectedData, setSelectedData] = useState("income");
  const [incomeData, setIncomeData] = useState([]);

  useEffect(() => {
    const organizerId = localStorage.getItem("userId");
    console.log("📦 Organizer ID from localStorage:", organizerId);
    if (organizerId) {
      fetchIncomeData(organizerId).then(setIncomeData);
    } else {
      console.warn("⚠️ Organizer ID not found in localStorage.");
    }
  }, []);

  return (
    <div className="w-[758px] bg-white rounded-2xl shadow-lg p-7 mt-6">
      <h2 className="text-[#3A6953] text-[26px] font-bold">Income Flow</h2>

      {/* Toggle Button */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-md ${
            selectedData === "income" ? "bg-[#6A8C73] text-white"
              : "bg-[#ECECEC] text-[#99C6A9]"
          }`}
          onClick={() => setSelectedData("income")}
        >
          Income
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-md ${
            selectedData === "transferred" ? "bg-[#6A8C73] text-white"
              : "bg-[#ECECEC] text-[#99C6A9]"
          }`}
          onClick={() => setSelectedData("transferred")}
        >
          Transferred
        </button>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={incomeData} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6A8C73" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6A8C73" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTransferred" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EB001B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EB001B" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis dataKey="month" stroke="#aaa" />
          <YAxis stroke="#aaa" tickFormatter={(value) => `₱${value / 1000}K`} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
          <Legend
            align="right"
            verticalAlign="top"
            wrapperStyle={{ paddingBottom: 20 }}
            formatter={(value) => (
              <span className={`font-semibold ${value === "Income" ? "text-green-700" : "text-gray-400"}`}>
                {value}
              </span>
            )}
          />
          {selectedData === "income" ? (
            <Area
              type="monotone"
              dataKey="income"
              stroke="#4CAF50"
              fillOpacity={1}
              fill="url(#colorIncome)"
              name="Income"
            />
          ) : (
            <Area
              type="monotone"
              dataKey="transferred"
              stroke="#FF6B6B"
              fillOpacity={1}
              fill="url(#colorTransferred)"
              name="Transferred"
            />
          )}
          {selectedData === "transferred" && (
            <Line
              type="monotone"
              dataKey="transferred"
              stroke="#FF6B6B"
              strokeWidth={2}
              strokeLinecap="round"
              dot={false}
              name="Transferred"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const COLORS = {
  Deposit: "#3A6953", // Dark Green
  Income: "#6A8C73",  // Medium Green
  Transfer: "#99C6A9" // Light Green
};

const fetchTransactionData = async (userId) => {
  console.log("🔵 Fetching transactions for user:", userId);
  try {
    const res = await fetch(`http://localhost:5050/api/wallet/transactions?userId=${userId}`);
    const transactions = await res.json();
    console.log("📥 [PieChart] Transactions fetched:", transactions);

    let deposit = 0;
    let income = 0;
    let transfer = 0;

    transactions.forEach((txn) => {
      if (txn.status === "confirmed") {
        if (txn.type === "deposit") deposit += txn.amount;
        if (txn.type === "withdraw") income += txn.amount;
        if (txn.type === "transfer") transfer += txn.amount;
      }
    });

    const total = deposit + income + transfer;
    const percent = (value) => (total ? ((value / total) * 100).toFixed(0) : 0);

    console.log(`✅ Calculated: Deposit ₱${deposit}, Income ₱${income}, Transfer ₱${transfer}`);

    return {
      deposit,
      income,
      transfer,
      depositPercent: percent(deposit),
      incomePercent: percent(income),
      transferPercent: percent(transfer)
    };
  } catch (error) {
    console.error("❌ [PieChart] Error fetching transactions:", error);
    return {
      deposit: 0, income: 0, transfer: 0,
      depositPercent: 0, incomePercent: 0, transferPercent: 0
    };
  }
};

// 🔥 Deposit Chart
export const DepositChart = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchTransactionData(userId).then(setData);
    }
  }, []);

  if (!data) return null;

  const depositData = [
    { name: "Deposit", value: data.deposit, color: COLORS.Deposit },
    { name: "Income", value: data.income, color: COLORS.Income },
    { name: "Transfer", value: data.transfer, color: COLORS.Transfer },
  ];

  return (
    <div className="w-[375px] bg-white rounded-2xl shadow-lg p-6 mt-6 flex flex-col items-center relative">
      <PieChart width={200} height={200}>
        <Pie
          data={depositData}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={80}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
        >
          {depositData.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>

      {/* Center */}
      <div className="absolute top-[37%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-center text-green-900 font-semibold">
        <p className="text-lg">{data.depositPercent}%</p>
        <p className="text-sm">Deposit</p>
      </div>

      {/* Summary */}
      <div className="flex justify-between w-full mt-8 text-[#5B5B5B]">
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Income</p>
          <p className="text-md font-semibold">₱{data.income.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-center bg-[#3A6953] text-white px-4 py-1 rounded-lg">
          <p className="text-sm font-medium">Deposit</p>
          <p className="text-md font-semibold">₱{data.deposit.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Transfer</p>
          <p className="text-md font-semibold">₱{data.transfer.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

// 🔥 Income Chart (just different center label)
export const IncomeChart = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchTransactionData(userId).then(setData);
    }
  }, []);

  if (!data) return null;

  const incomeData = [
    { name: "Deposit", value: data.deposit, color: COLORS.Deposit },
    { name: "Income", value: data.income, color: COLORS.Income },
    { name: "Transfer", value: data.transfer, color: COLORS.Transfer },
  ];

  return (
    <div className="w-[375px] bg-white rounded-2xl shadow-lg p-6 mt-6 flex flex-col items-center relative">
      <div className="relative flex items-center justify-center">
        <PieChart width={200} height={200}>
          <Pie
            data={incomeData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
          >
            {incomeData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>

        <div className="absolute flex flex-col items-center text-green-900 font-semibold">
          <p className="text-lg">{data.incomePercent}%</p>
          <p className="text-sm">Income</p>
        </div>
      </div>

      <div className="flex justify-between w-full mt-6 text-[#5B5B5B]">
        <div className="flex flex-col items-center bg-[#6A8C73] text-white px-4 py-1 rounded-lg">
          <p className="text-sm font-medium">Income</p>
          <p className="text-md font-semibold">₱{data.income.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Deposit</p>
          <p className="text-md font-semibold">₱{data.deposit.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Transfer</p>
          <p className="text-md font-semibold">₱{data.transfer.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

// 🔥 Transfer Chart (different center label)
export const TransferChart = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchTransactionData(userId).then(setData);
    }
  }, []);

  if (!data) return null;

  const transferData = [
    { name: "Deposit", value: data.deposit, color: COLORS.Deposit },
    { name: "Income", value: data.income, color: COLORS.Income },
    { name: "Transfer", value: data.transfer, color: COLORS.Transfer },
  ];

  return (
    <div className="w-[375px] bg-white rounded-2xl shadow-lg p-6 mt-6 flex flex-col items-center relative">
      <div className="relative flex items-center justify-center">
        <PieChart width={200} height={200}>
          <Pie
            data={transferData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
          >
            {transferData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>

        <div className="absolute flex flex-col items-center text-green-900 font-semibold">
          <p className="text-lg">{data.transferPercent}%</p>
          <p className="text-sm">Transfer</p>
        </div>
      </div>

      <div className="flex justify-between w-full mt-6 text-[#5B5B5B]">
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Income</p>
          <p className="text-md font-semibold">₱{data.income.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Deposit</p>
          <p className="text-md font-semibold">₱{data.deposit.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-center bg-[#99C6A9] text-white px-4 py-1 rounded-lg">
          <p className="text-sm font-medium">Transfer</p>
          <p className="text-md font-semibold">₱{data.transfer.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};


const Analytics= () => {
  return (
    <div className="p-2 flex justify-center">
      <div className="grid grid-cols-3 gap-8 max-w-[1500px]">
        <div className="ml-[20px] : ml-[20px] col-span-2">
          <h1 className="text-4xl font-bold text-[#285236] mb-2">Analytics</h1>
          <p className="text-[#6A8C73] font-normal mb-6">
          Here’s your analysis of your Paluwagan today. You can view your income 
          flow and group performance.
          </p>

          <PerformanceOverview />
          <IncomeFlowChart />
        </div>

        <div className="mt-[73px] flex flex-col items-center">
          <DepositChart />
          <IncomeChart />
          <TransferChart />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
