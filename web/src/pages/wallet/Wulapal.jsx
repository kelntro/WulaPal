import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { GoArrowDownLeft, GoArrowUpRight } from "react-icons/go";
import { PiHandDepositBold } from "react-icons/pi";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { PiHandWithdrawBold } from "react-icons/pi";
import { IoIosArrowDown } from "react-icons/io";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const AccountBalanceCard = () => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.warn("User ID missing");
      return;
    }

    fetch(`http://localhost:5050/api/wallet/balance?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setBalance(data.balance || 0))
      .catch((err) => {
        console.error("Error fetching balance:", err);
      });
  }, []);

  return (
    <div className="w-[375px] bg-white rounded-[20px] shadow-md p-6">
      <h2 className="text-[#3a6953] text-[22px] font-bold">Account Balance</h2>
      <p className="text-[#6A8C73] text-sm mt-2">Here’s your remaining balance</p>
      <div className="w-full h-[150px] mt-4 rounded-[20px] bg-gradient-to-b from-[#99c6a9] to-[#6a8c73] flex flex-col justify-center p-6">
        <span className="text-white text-sm">Current Balance</span>
        <span className="text-white text-3xl font-semibold">₱{balance.toLocaleString()}</span>
      </div>
      <button className="w-full mt-4 h-10 rounded-[10px] border border-[#6a8c73] text-[#3a6953] text-xs font-normal">
        Get Income Statement
      </button>
    </div>
  );
};


const Wallet = () => {
  return (
    <div className="p-2 flex justify-center ml-[40px]">
      <div className="max-w-[1500px] p-2">
        {/* Wallet Header */}
        <h1 className="text-4xl font-bold text-[#285236]">WulaPal Wallet</h1>
        <p className="text-[#6A8C73] mb-6">Here’s your Wulapal wallet data.</p>

        <div className="grid grid-cols-3 gap-[30px]">
          {/* Left Column - Account Balance */}
          <div className="col-span-1">
            <AccountBalanceCard />
          </div>

          {/* Right Column - Buttons & Stats */}
          <div className="col-span-2 flex flex-col">
            {/* Buttons */}
            <div className="flex gap-[20px] justify-end mb-6 mr-[28px]">
              <DepositButton />
              <TransferButton />
              <WithdrawButton />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-5">
              <StatCard title="Total Income" amount="₱632.00" icon={<GoArrowDownLeft />} change="+1.29%" changeColor="text-[#285236]" changeBg="bg-[#E5F8ED]" />
              <StatCard title="Total Contribution" amount="₱632.00" icon={<GoArrowUpRight />} change="-1.29%" changeColor="text-[#9B2C2C]" changeBg="bg-[#FBE7E7]" />
              <StatCard title="Total Deposit" amount="₱300.00" icon={<GoArrowDownLeft />} change="+1.29%" changeColor="text-[#285236]" changeBg="bg-[#E5F8ED]" />
              <StatCard title="Total Transfer" amount="₱1,245.00" icon={<GoArrowUpRight />} change="-1.29%" changeColor="text-[#9B2C2C]" changeBg="bg-[#FBE7E7]" />
            </div>
          </div>
        </div>
        <AnalyticsChart />
        <CashActivityChart />
      </div>
    </div>
  );
};

// Deposit Button
const DepositButton = () => {
  const navigate = useNavigate(); // Move useNavigate inside the component

  return (
    <button
      className="flex items-center gap-2 pt-[8px] pb-[8px] pr-[70px] pl-[70px] rounded-[50px] bg-white shadow-md border hover:shadow-lg transition justify-center"
      onClick={() => navigate("/wallet/deposit")} // Ensure the correct route
    >
      <PiHandDepositBold className="text-[#DED411] text-lg" />
      <span className="text-[#DED411] font-medium text-lg">Deposit</span>
    </button>
  );
};
// Transfer Button
const TransferButton = () => {
  const navigate = useNavigate(); // Move useNavigate inside the component

  return (
    <button 
      className="flex items-center gap-2 pt-[8px] pb-[8px] pr-[70px] pl-[70px] rounded-[50px] bg-white shadow-md border hover:shadow-lg transition justify-center"
      onClick={() => navigate("/wallet/transfer")}
    >
      <FaMoneyBillTransfer className="text-blue-700 text-lg" />
      <span className="text-blue-700 font-medium text-lg">Transfer</span>
    </button>
  );
};

// Withdraw Button
const WithdrawButton = () => {
  const navigate = useNavigate(); // Move useNavigate inside the component

  return (
    <button 
      className="flex items-center gap-2 pt-[8px] pb-[8px] pr-[70px] pl-[70px] rounded-[50px] bg-white shadow-md border hover:shadow-lg transition justify-center"
      onClick={() => navigate("/wallet/withdraw")}
      >
      <PiHandWithdrawBold className="text-[#3A6953] text-lg" />
      <span className="text-[#3A6953] font-medium text-lg">Withdraw</span>
    </button>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, amount, icon, change, changeColor, changeBg }) => {
  return (
    <div className="w-[355px] h-[120px] bg-white rounded-[20px] shadow-md p-6 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-[45px] h-[45px] flex items-center justify-center bg-[#6a8c73] rounded-[10px] text-white">
          {icon}
        </div>
        <div className="ml-5">
          <div className="text-[#285236] text-base font-normal">{title}</div>
          <div className="text-[#3a6953] text-2xl font-normal">{amount}</div>
        </div>
      </div>
      <div className={`${changeColor} ${changeBg} px-3 py-1 rounded-full text-sm`}>
        {change}
      </div>
    </div>
  );
};

const data = [
  { month: "Jan", income: 85000, contribution: 75000, transfer: 60000, deposit: 50000 },
  { month: "Feb", income: 86000, contribution: 80000, transfer: 65000, deposit: 55000 },
  { month: "Mar", income: 70000, contribution: 60000, transfer: 50000, deposit: 45000 },
  { month: "Apr", income: 95000, contribution: 85000, transfer: 80000, deposit: 70000 },
  { month: "May", income: 84000, contribution: 90000, transfer: 75000, deposit: 65000 },
  { month: "Jun", income: 75000, contribution: 65000, transfer: 55000, deposit: 50000 },
  { month: "Jul", income: 60000, contribution: 55000, transfer: 45000, deposit: 40000 },
  { month: "Aug", income: 65000, contribution: 60000, transfer: 50000, deposit: 45000 },
  { month: "Sep", income: 78000, contribution: 70000, transfer: 65000, deposit: 55000 },
  { month: "Oct", income: 85000, contribution: 78000, transfer: 70000, deposit: 60000 },
  { month: "Nov", income: 92000, contribution: 80000, transfer: 75000, deposit: 65000 },
  { month: "Dec", income: 98000, contribution: 85000, transfer: 80000, deposit: 70000 },
];

const AnalyticsChart = () => {
  return (
    <div className="w-[1158px] bg-white rounded-[20px] shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#3A6953] text-[26px] font-bold">Statistical Overview</h2>
        <div className="relative mr-4">
          <select className="appearance-none border border-[#99C6A9] pl-4 pr-10 py-2 rounded-full text-[15px] font-medium focus:outline-none">
            <option>2025</option>
            <option>2026</option>
            <option>2027</option>
            <option>2028</option>
            <option>2029</option>
            <option>2030</option>
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[#3a6953]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 10, right: 15, left: 13, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `₱${value.toLocaleString()}`} />
          <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
          <Legend />
          <Bar dataKey="income" fill="#7FC8A9" barSize={10} name="Income" radius={[10, 10, 0, 0]} />
          <Bar dataKey="contribution" fill="#FF9AA2" barSize={10} name="Contribution" radius={[10, 10, 0, 0]} />
          <Bar dataKey="transfer" fill="#B5D3FF" barSize={10} name="Transfer" radius={[10, 10, 0, 0]} />
          <Bar dataKey="deposit" fill="#EBE571" barSize={10} name="Deposit" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


const generateData = (year, month) => {
  const daysInMonth = dayjs(`${year}-${month}`, "YYYY-MM").daysInMonth();
  let data = [];

  for (let day = 1; day <= daysInMonth; day++) {
    data.push({
      date: `${year}-${month}-${String(day).padStart(2, "0")}`,
      income: Math.floor(Math.random() * 40000) + 10000,
      contribute: Math.floor(Math.random() * 30000) + 5000,
    });
  }
  return data;
};

const CashActivityChart = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("01");
  const data = generateData(selectedYear, selectedMonth);

  return (
    <div className="w-[1158px] bg-white rounded-[20px] shadow-md p-[20px] mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#3A6953] text-[22px] font-bold">Cash Activity</h2>

        {/* Dropdowns */}
        <div className="flex gap-4 mr-4">
          {/* Year Dropdown */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none border border-[#99C6A9] pl-4 pr-10 py-2 rounded-full text-[15px] font-medium focus:outline-none"
            >
              {["2025", "2026", "2027", "2028", "2029"].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <IoIosArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#3A6953] pointer-events-none" />
          </div>

          {/* Month Dropdown */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none border border-[#99C6A9] pl-4 pr-10 py-2 rounded-full text-[15px] font-medium focus:outline-none"
            >
              {[...Array(12).keys()].map((month) => {
                const monthNumber = String(month + 1).padStart(2, "0");
                return (
                  <option key={monthNumber} value={monthNumber}>
                    {dayjs(`${selectedYear}-${monthNumber}-01`).format("MMMM")}
                  </option>
                );
              })}
            </select>
            <IoIosArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#3A6953] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={(date) => dayjs(date).format("MMM DD")} />
          <YAxis domain={[0, 50000]} tickFormatter={(value) => `₱${value.toLocaleString()}`} />
          <Tooltip labelFormatter={(label) => dayjs(label).format("MMMM DD, YYYY")} formatter={(value) => `₱${value.toLocaleString()}`} />
          <Legend />
          {/* Income Line */}
          <Line type="monotone" dataKey="income" stroke="#6A8C73" strokeWidth={3} dot={false} strokeLinecap="round" />
          {/* Contribute Line (Dotted) */}
          <Line type="monotone" dataKey="contribute" stroke="#FF9AA2" strokeWidth={3} dot={false} strokeLinecap="round" strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Wallet;
