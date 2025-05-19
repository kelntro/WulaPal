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
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
dayjs.extend(customParseFormat);

const AccountBalanceCard = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const loadLogoBase64 = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
    });
  
  const generateIncomeStatement = async () => {
    setLoading(true);
    const userId = localStorage.getItem("userId");
  
    if (!userId) {
      console.warn("User ID missing");
      setLoading(false);
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:5050/api/wallet/transactions?userId=${userId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  
      const transactions = await res.json();
      if (!Array.isArray(transactions)) throw new Error("Invalid transactions data received");
  
      let totalIncome = 0, totalExpenses = 0, deposits = 0, withdrawals = 0, transfers = 0, receives = 0;
      transactions.forEach((txn) => {
        if (!txn.type || typeof txn.amount !== 'number') return;
        if (txn.type === "deposit") { deposits += txn.amount; totalIncome += txn.amount; }
        if (txn.type === "withdraw") { withdrawals += txn.amount; totalExpenses += txn.amount; }
        if (txn.type === "transfer") { transfers += txn.amount; totalExpenses += txn.amount; }
        if (txn.type === "receive") { receives += txn.amount; totalIncome += txn.amount; }
      });
  
      const doc = new jsPDF();
      doc.setFont("helvetica", "normal"); // 🧠 Fixes ₱ encoding issue
  
      const logoBase64 = await loadLogoBase64(`${window.location.origin}/assets/4.png`);
      doc.addImage(logoBase64, 'PNG', -15, 10, 110, 20); // Top-left logo

      doc.setFontSize(16);
      doc.setTextColor(58, 105, 83);
      doc.text("Income Statement", 20, 35);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
  
      // Summary Table
      doc.setFontSize(14);
      doc.setTextColor(58, 105, 83);
      doc.text("Summary", 20, 55);
      autoTable(doc, {
        startY: 60,
        head: [["Category", "Amount"]],
        body: [
          ["Total Income", `PHP ${totalIncome.toLocaleString()}`],
          ["Total Expenses", `PHP ${totalExpenses.toLocaleString()}`],
          ["Net Balance", `PHP ${(totalIncome - totalExpenses).toLocaleString()}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [58, 105, 83] },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 60, halign: 'right' } }
      });
  
      // Details Table
      doc.setFontSize(14);
      doc.setTextColor(58, 105, 83);
      doc.text("Transaction Details", 20, doc.lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Type", "Amount"]],
        body: [
          ["Deposits", `PHP ${deposits.toLocaleString()}`],
          ["Receives", `PHP ${receives.toLocaleString()}`],
          ["Withdrawals", `PHP ${withdrawals.toLocaleString()}`],
          ["Transfers", `PHP ${transfers.toLocaleString()}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [58, 105, 83] },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 60, halign: 'right' } }
      });
  
      // Transaction History Table
      doc.setFontSize(14);
      doc.setTextColor(58, 105, 83);
      doc.text("Transaction History", 20, doc.lastAutoTable.finalY + 15);
      const transactionData = transactions.map(txn => [
        new Date(txn.timestamp).toLocaleDateString(),
        txn.type.toUpperCase(),
        `PHP ${txn.amount.toLocaleString()}`,
        txn.status || 'N/A',
        txn.metadata?.to || txn.metadata?.from || '-'
      ]);
  
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Date", "Type", "Amount", "Status"]],
        body: transactionData,
        theme: 'grid',
        headStyles: { fillColor: [58, 105, 83] },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 28 }, // Date
          1: { cellWidth: 25 }, // Type
          2: { cellWidth: 35, halign: 'right' }, // Amount
          3: { cellWidth: 25 }, // Status
        }
      });
  
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text("Powered by WulaPal – Secure Group Savings Made Simple", 20, doc.internal.pageSize.height - 20);
      }
  
      doc.save(`income-statement-${new Date().toISOString().split('T')[0]}.pdf`);
      console.log("✅ PDF generated successfully");
  
    } catch (error) {
      console.error("Error generating statement:", error);
      alert(`Failed to generate income statement: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="w-[375px] bg-white rounded-[20px] shadow-md p-6">
      <h2 className="text-[#3a6953] text-[22px] font-bold">Account Balance</h2>
      <p className="text-[#6A8C73] text-sm mt-2">
        Here's your remaining balance
      </p>
      <div className="w-full h-[150px] mt-4 rounded-[20px] bg-gradient-to-b from-[#99c6a9] to-[#6a8c73] flex flex-col justify-center p-6">
        <span className="text-white text-sm">Current Balance</span>
        <span className="text-white text-3xl font-semibold">
          ₱{balance.toLocaleString()}
        </span>
      </div>
      <button 
        className="w-full mt-4 h-10 rounded-[10px] border border-[#6a8c73] text-[#3a6953] text-xs font-normal hover:bg-[#6a8c73] hover:text-white transition-colors duration-200 flex items-center justify-center"
        onClick={generateIncomeStatement}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-[#3a6953]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </span>
        ) : (
          "Get Income Statement"
        )}
      </button>
    </div>
  );
};

const Wallet = () => {
  const navigate = useNavigate();

  const [walletSummary, setWalletSummary] = useState({
    deposit: 0,
    withdraw: 0,
    receive: 0,
    transfer: 0,
  });

  useEffect(() => {
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
        let receive = 0;
        let transfer = 0;

        transactions.forEach((txn) => {
          if (txn.type === "deposit") deposit += txn.amount;
          if (txn.type === "withdraw") withdraw += txn.amount;
          if (txn.type === "receive" || txn.type === "payout_share") receive += txn.amount;
          if (txn.type === "transfer") transfer += txn.amount;
        });

        setWalletSummary({ deposit, withdraw, receive, transfer });
        console.log("✅ Wallet Stats Fetched:", {
          deposit,
          withdraw,
          receive,
          transfer,
        });
      } catch (error) {
        console.error("❌ Error fetching wallet transactions:", error.message);
      }
    };

    fetchWalletSummary();
  }, []);

  return (
    <div className="p-2 flex justify-center ml-[40px]">
      <div className="max-w-[1500px] p-2">
        <h1 className="text-4xl font-bold text-[#285236]">WulaPal Wallet</h1>
        <p className="text-[#6A8C73] mb-6">Here's your WulaPal wallet data.</p>

        <div className="grid grid-cols-3 gap-[30px]">
          {/* Left Column - Account Balance */}
          <div className="col-span-1">
            <AccountBalanceCard />
          </div>

          {/* Right Column - Stats */}
          <div className="col-span-2 flex flex-col">
            {/* Buttons */}
            <div className="flex gap-[20px] justify-end mb-6 mr-[28px]">
              <DepositButton />
              <TransferButton />
              <WithdrawButton />
            </div>

            {/* Wallet Stats Grid */}
            <div className="grid grid-cols-2 gap-5">
              <StatCard
                title="Total Deposit"
                amount={`₱${walletSummary.deposit.toLocaleString()}`}
                icon={<GoArrowUpRight />}              />
              <StatCard
                title="Total Withdraw"
                amount={`₱${walletSummary.withdraw.toLocaleString()}`}
                icon={<GoArrowUpRight />}              />
              <StatCard
                title="Total Receive"
                amount={`₱${walletSummary.receive.toLocaleString()}`}
                icon={<GoArrowUpRight />}              />
              <StatCard
                title="Total Transfer"
                amount={`₱${walletSummary.transfer.toLocaleString()}`}
                icon={<GoArrowUpRight />}
              />
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
      <div
        className={`${changeColor} ${changeBg} px-3 py-1 rounded-full text-sm`}
      >
        {change}
      </div>
    </div>
  );
};

const data = [
  {
    month: "Jan",
    income: 85000,
    contribution: 75000,
    transfer: 60000,
    deposit: 50000,
  },
  {
    month: "Feb",
    income: 86000,
    contribution: 80000,
    transfer: 65000,
    deposit: 55000,
  },
  {
    month: "Mar",
    income: 70000,
    contribution: 60000,
    transfer: 50000,
    deposit: 45000,
  },
  {
    month: "Apr",
    income: 95000,
    contribution: 85000,
    transfer: 80000,
    deposit: 70000,
  },
  {
    month: "May",
    income: 84000,
    contribution: 90000,
    transfer: 75000,
    deposit: 65000,
  },
  {
    month: "Jun",
    income: 75000,
    contribution: 65000,
    transfer: 55000,
    deposit: 50000,
  },
  {
    month: "Jul",
    income: 60000,
    contribution: 55000,
    transfer: 45000,
    deposit: 40000,
  },
  {
    month: "Aug",
    income: 65000,
    contribution: 60000,
    transfer: 50000,
    deposit: 45000,
  },
  {
    month: "Sep",
    income: 78000,
    contribution: 70000,
    transfer: 65000,
    deposit: 55000,
  },
  {
    month: "Oct",
    income: 85000,
    contribution: 78000,
    transfer: 70000,
    deposit: 60000,
  },
  {
    month: "Nov",
    income: 92000,
    contribution: 80000,
    transfer: 75000,
    deposit: 65000,
  },
  {
    month: "Dec",
    income: 98000,
    contribution: 85000,
    transfer: 80000,
    deposit: 70000,
  },
];

const AnalyticsChart = () => {
  const [viewType, setViewType] = useState("monthly");
  const [chartData, setChartData] = useState([]);
  const [rawTransactions, setRawTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (rawTransactions.length > 0) {
      processChartData();
    }
  }, [viewType, rawTransactions]);

  const fetchTransactions = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await fetch(
        `http://localhost:5050/api/wallet/transactions?userId=${userId}`
      );
      const transactions = await res.json();
      console.log("📥 [AnalyticsChart] Transactions fetched:", transactions);
      setRawTransactions(transactions);
    } catch (err) {
      console.error("❌ Error fetching transactions:", err.message);
    }
  };

  const processChartData = () => {
    if (viewType === "monthly") {
      const monthlyData = Array.from({ length: 12 }, (_, index) => ({
        month: new Date(0, index).toLocaleString("default", { month: "short" }),
        deposit: 0,
        withdraw: 0,
        receive: 0,
        transfer: 0,
      }));

      rawTransactions.forEach((txn) => {
        const date = new Date(txn.timestamp);
        const month = date.getMonth(); // 0-11
        if (txn.type === "deposit") monthlyData[month].deposit += txn.amount;
        if (txn.type === "withdraw") monthlyData[month].withdraw += txn.amount;
        if (txn.type === "receive" || txn.type === "payout_share") monthlyData[month].receive += txn.amount;
        if (txn.type === "transfer") monthlyData[month].transfer += txn.amount;
      });

      console.log("✅ Processed Monthly Data:", monthlyData);
      setChartData(monthlyData);
    } else if (viewType === "yearly") {
      const yearlyDataMap = {};

      rawTransactions.forEach((txn) => {
        const year = new Date(txn.timestamp).getFullYear();
        if (!yearlyDataMap[year]) {
          yearlyDataMap[year] = {
            year,
            deposit: 0,
            withdraw: 0,
            receive: 0,
            transfer: 0,
          };
        }
        if (txn.type === "deposit") yearlyDataMap[year].deposit += txn.amount;
        if (txn.type === "withdraw") yearlyDataMap[year].withdraw += txn.amount;
        if (txn.type === "receive" || txn.type === "payout_share") yearlyDataMap[year].receive += txn.amount;
        if (txn.type === "transfer") yearlyDataMap[year].transfer += txn.amount;
      });

      const yearlyData = Object.values(yearlyDataMap).sort(
        (a, b) => a.year - b.year
      );
      console.log("✅ Processed Yearly Data:", yearlyData);
      setChartData(yearlyData);
    }
  };

  return (
    <div className="w-[1158px] bg-white rounded-[20px] shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#3A6953] text-[26px] font-bold">
          Statistical Overview
        </h2>
        <div className="relative mr-4">
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="appearance-none border border-[#99C6A9] pl-4 pr-10 py-2 rounded-full text-[15px] font-medium focus:outline-none"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-[#3a6953]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.586l3.71-3.355a.75.75 0 111.04 1.08l-4.25 3.83a.75.75 0 01-1.04 0l-4.25-3.83a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 15, left: 13, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={viewType === "monthly" ? "month" : "year"} />
          <YAxis tickFormatter={(value) => `₱${value.toLocaleString()}`} />
          <Tooltip
            formatter={(value) => `₱${Number(value).toLocaleString()}`}
          />
          <Legend />
          <Bar
            dataKey="deposit"
            fill="#EBE571"
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
            dataKey="receive"
            fill="#7FC8A9"
            barSize={10}
            name="Receive"
            radius={[10, 10, 0, 0]}
          />
          <Bar
            dataKey="transfer"
            fill="#B5D3FF"
            barSize={10}
            name="Transfer"
            radius={[10, 10, 0, 0]}
          />
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
  const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY"));
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("MM"));
  const [data, setData] = useState([]);
  const [rawTransactions, setRawTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (rawTransactions.length > 0) {
      generateChartData();
    }
  }, [selectedYear, selectedMonth, rawTransactions]);

  const fetchTransactions = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await fetch(
        `http://localhost:5050/api/wallet/transactions?userId=${userId}`
      );
      const transactions = await res.json();
      console.log("📥 [CashActivityChart] Transactions fetched:", transactions);
      setRawTransactions(transactions);
    } catch (err) {
      console.error("❌ Error fetching transactions:", err.message);
    }
  };

  const generateChartData = () => {
    const daysInMonth = dayjs(
      `${selectedYear}-${selectedMonth}`,
      "YYYY-MM"
    ).daysInMonth();

    const dayMap = Array.from({ length: daysInMonth }, (_, i) => ({
      date: dayjs(
        `${selectedYear}-${selectedMonth}-${String(i + 1).padStart(2, "0")}`
      ).format("YYYY-MM-DD"),
      Income: 0,
      Transfer: 0,
    }));

    rawTransactions.forEach((txn) => {
      const txnDate = dayjs(txn.timestamp).format("YYYY-MM-DD");
      const txnYear = dayjs(txn.timestamp).year();
      const txnMonth = dayjs(txn.timestamp).month() + 1; // dayjs month starts at 0
      const txnMonthFormatted = String(txnMonth).padStart(2, "0");

      if (
        txnYear.toString() === selectedYear &&
        txnMonthFormatted === selectedMonth
      ) {
        const dayEntry = dayMap.find((d) => d.date === txnDate);
        if (dayEntry) {
          if (txn.type === "deposit" || txn.type === "receive") {
            dayEntry.Income += txn.amount;
          }
          if (txn.type === "transfer") {
            dayEntry.Transfer += txn.amount;
          }
        }
      }
    });

    console.log("✅ Generated Cash Activity Data:", dayMap);
    setData(dayMap);
  };

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
                <option key={year} value={year}>
                  {year}
                </option>
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
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => dayjs(date).format("MMM DD")}
          />
          <YAxis tickFormatter={(value) => `₱${value.toLocaleString()}`} />
          <Tooltip
            labelFormatter={(label) => dayjs(label).format("MMMM DD, YYYY")}
            formatter={(value) => `₱${Number(value).toLocaleString()}`}
          />
          <Legend />
          {/* Income Line */}
          <Line
            type="monotone"
            dataKey="Income"
            stroke="#6A8C73"
            strokeWidth={3}
            dot={false}
            strokeLinecap="round"
          />
          {/* Contribution Line */}
          <Line
            type="monotone"
            dataKey="Transfer"
            stroke="#8CB6E6"
            strokeWidth={3}
            dot={false}
            strokeLinecap="round"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Wallet;
