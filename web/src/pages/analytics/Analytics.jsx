"use client";

import React, { useState } from "react";
import { HiChevronRight } from "react-icons/hi";
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

const performanceData = [
  { month: "Jan", active: 85, inactive: 35 },
  { month: "Feb", active: 86, inactive: 52 },
  { month: "Mar", active: 70, inactive: 65 },
  { month: "Apr", active: 95, inactive: 24 },
  { month: "May", active: 84, inactive: 40 },
  { month: "Jun", active: 75, inactive: 22 },
  { month: "Jul", active: 60, inactive: 34 },
  { month: "Aug", active: 65, inactive: 52 },
  { month: "Sep", active: 78, inactive: 12 },
  { month: "Oct", active: 85, inactive: 42 },
  { month: "Nov", active: 92, inactive: 32 },
  { month: "Dec", active: 98, inactive: 9 },
];

const PerformanceOverview = () => {
  return (
        <div className="w-[758px] bg-white rounded-[20px] shadow-md p-7 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#3A6953] text-[26px] font-bold">Group Performance Overview</h2>
        <div className="relative">
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
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={performanceData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}`} />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="active" 
            fill="#7FC8A9" 
            barSize={10} 
            name="Active" 
            radius={[10, 10, 0, 0]} 
          />
          <Bar 
            dataKey="inactive" 
            fill="#FF9AA2" 
            barSize={10} 
            name="Inactive" 
            radius={[10, 10, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const incomeData = [
  { month: "Jan", income: 10000, transferred: 5000 },
  { month: "Feb", income: 12000, transferred: 7000 },
  { month: "Mar", income: 25000, transferred: 10000 },
  { month: "Apr", income: 30000, transferred: 15000 },
  { month: "May", income: 28000, transferred: 12000 },
  { month: "Jun", income: 27000, transferred: 13000 },
  { month: "Jul", income: 26000, transferred: 11000 },
  { month: "Aug", income: 25000, transferred: 14000 },
  { month: "Sep", income: 10000, transferred: 8000 },
  { month: "Oct", income: 26000, transferred: 11000 },
  { month: "Nov", income: 25000, transferred: 14000 },
  { month: "Dec", income: 10000, transferred: 8000 },
];

const IncomeFlowChart = () => {
  const [selectedData, setSelectedData] = useState("income");

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
          {/* Gradient Definitions */}
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

          {/* Axes & Grid */}
          <XAxis dataKey="month" stroke="#aaa" />
          <YAxis stroke="#aaa" tickFormatter={(value) => `₱${value / 1000}K`} />
          <CartesianGrid strokeDasharray="3 3" />

          {/* Tooltip */}
          <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />

          {/* Legend */}
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

          {/* Dynamic Area & Line */}
          {selectedData === "income" ? (
            <Area type="monotone" dataKey="income" stroke="#4CAF50" fillOpacity={1} fill="url(#colorIncome)" name="Income" />
          ) : (
            <Area type="monotone" dataKey="transferred" stroke="#FF6B6B" fillOpacity={1} fill="url(#colorTransferred)" name="Transferred" />
          )}

          {selectedData === "transferred" && (
            <Line type="monotone" dataKey="transferred" stroke="#FF6B6B" strokeWidth={2} strokeLinecap="round" dot={false} name="Transferred" />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const depositData = [
  { name: "Deposit", value: 55, color: "#3A6953" },  // Dark Green
  { name: "Income", value: 35, color: "#6A8C73" }, // Medium Green
  { name: "Transfer", value: 10, color: "#99C6A9" } // Light Green
];

const DepositChart = () => {
  return (
    <div className="w-[375px] bg-white rounded-2xl shadow-lg p-6 mt-6 flex flex-col items-center relative">
      {/* Pie Chart */}
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
          {depositData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
      
      {/* Centered Text Inside Pie Chart */}
      <div className="absolute top-[37%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-center text-green-900 font-semibold">
        <p className="text-lg">55%</p>
        <p className="text-sm">Deposit</p>
      </div>

      {/* Summary Section Below Chart */}
      <div className="flex justify-between w-full mt-8 text-[#5B5B5B]">
        {/* Income */}
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Income</p>
          <p className="text-md font-semibold">₱5000.00</p>
        </div>

        {/* Deposit - Highlighted */}
        <div className="flex flex-col items-center bg-[#3A6953] text-white px-4 py-1 rounded-lg">
          <p className="text-sm font-medium">Deposit</p>
          <p className="text-md font-semibold">₱15000.00</p>
        </div>

        {/* Transfer */}
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Transfer</p>
          <p className="text-md font-semibold">₱1000.00</p>
        </div>
      </div>
    </div>
  );
};

const incomePieData = [
  { name: "Deposit", value: 55, color: "#3A6953" },  // Dark Green
  { name: "Income", value: 35, color: "#6A8C73" }, // Medium Green
  { name: "Transfer", value: 10, color: "#99C6A9" } // Light Green
];

const IncomeChart = () => {
  return (
    <div className="w-[375px] bg-white rounded-2xl shadow-lg p-6 mt-6 flex flex-col items-center relative">
      {/* Pie Chart */}
      <div className="relative flex items-center justify-center">
        <PieChart width={200} height={200}>
          <Pie
            data={incomePieData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
          >
            {incomePieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>

        {/* Centered Text Inside Pie Chart */}
        <div className="absolute flex flex-col items-center text-green-900 font-semibold">
          <p className="text-lg">35%</p>
          <p className="text-sm">Income</p>
        </div>
      </div>

      {/* Summary Section Below Chart */}
      <div className="flex justify-between w-full mt-6 text-[#5B5B5B]">
        {/* Income */}
        <div className="flex flex-col items-center bg-[#6A8C73] text-white px-4 py-1 rounded-lg">
          <p className="text-sm font-medium">Income</p>
          <p className="text-md font-semibold">₱5000.00</p>
        </div>

        {/* Deposit - Highlighted */}
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Deposit</p>
          <p className="text-md font-semibold">₱15000.00</p>
        </div>

        {/* Transfer */}
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Transfer</p>
          <p className="text-md font-semibold">₱1000.00</p>
        </div>
      </div>
    </div>
  );
};

const transferData = [
  { name: "Deposit", value: 55, color: "#3A6953" },  // Dark Green
  { name: "Income", value: 35, color: "#6A8C73" }, // Medium Green
  { name: "Transfer", value: 10, color: "#99C6A9" } // Light Green
];

const TransferChart = () => {
  return (
    <div className="w-[375px] bg-white rounded-2xl shadow-lg p-6 mt-6 flex flex-col items-center relative">
      {/* Pie Chart */}
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
            {transferData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>

        {/* Centered Text Inside Pie Chart */}
        <div className="absolute flex flex-col items-center text-green-900 font-semibold">
          <p className="text-lg">10%</p>
          <p className="text-sm">Transfer</p>
        </div>
      </div>

      {/* Summary Section Below Chart */}
      <div className="flex justify-between w-full mt-6 text-[#5B5B5B]">
        {/* Income */}
        <div className="flex flex-col items-center ">
          <p className="text-sm font-medium">Income</p>
          <p className="text-md font-semibold">₱5000.00</p>
        </div>

        {/* Deposit - Highlighted */}
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Deposit</p>
          <p className="text-md font-semibold">₱15000.00</p>
        </div>

        {/* Transfer */}
        <div className="flex flex-col items-center bg-[#99C6A9] text-white px-4 py-1 rounded-lg">
          <p className="text-sm font-medium">Transfer</p>
          <p className="text-md font-semibold">₱1000.00</p>
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
