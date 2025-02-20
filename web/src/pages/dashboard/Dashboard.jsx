"use client";

import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { GoArrowDownLeft, GoArrowUpRight } from "react-icons/go";
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
} from "recharts";

const AccountBalanceCard = () => {
  return (
    <div className="w-[375px] bg-white rounded-[20px] shadow-md p-6">
      <h2 className="text-[#3a6953] text-[22px] font-bold">Account Balance</h2>
      <p className="text-[#6A8C73] text-sm mt-2">Here’s your remaining balance</p>
      <div className="w-full h-[150px] mt-4 rounded-[20px] bg-gradient-to-b from-[#99c6a9] to-[#6a8c73] flex flex-col justify-center p-6">
        <span className="text-white text-sm">Current Balance</span>
        <span className="text-white text-3xl font-semibold">₱15,750.20</span>
      </div>
      <button className="w-full mt-4 h-10 rounded-[10px] border border-[#6a8c73] text-[#3a6953] text-xs font-normal">
        View more
      </button>
    </div>
  );
};

const GroupSlotsCard = () => {
  return (
    <div className="w-[375px] bg-white rounded-3xl shadow-md p-6 mt-6">
      <div className="flex justify-between items-center">
        <h1 className="text-[#3a6953] text-[22px] font-bold">Group Slots</h1>
        <button className="flex gap-1 px-2 py-2 text-xs text-white rounded-xl bg-[#89A598]">
          Get more slots <HiChevronRight className=" w-4 h-4 text-white" />
        </button>
      </div>
      <div className="relative flex justify-center mt-[30px]">
        <PieChart
          width={200}
          height={150}
          series={[{
            data: [
              { id: 1, value: 55, color: "#285236" },
              { id: 2, value: 35, color: "#99c6a9" },
              { id: 3, value: 15, color: "#BFFFE4" }
            ],
            innerRadius: 40,
            outerRadius: 105,
            paddingAngle: 1,
            cornerRadius: 5,
            startAngle: -90,
            endAngle: 90,
            cx: 100,
            cy: 100,
          }]} 
        />
      </div>
           <div className="flex flex-col mt-[-10px] text-[#285236] space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#285236] rounded-full" />
            <span className="text-sm">Unavailable Slots</span>
          </div>
          <p className="text-lg font-medium">55%</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#99c6a9] rounded-full" />
            <span className="text-sm">Available Slots</span>
          </div>
          <p className="text-lg font-medium">35%</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#BFFFE4] rounded-full" />
            <span className="text-sm">Empty Slots</span>
          </div>
          <p className="text-lg font-medium">15%</p>
        </div>
      </div>
      <button className="w-full mt-6 py-3 bg-[#D4E8DB] text-[#3A6953] border border-[#6a8c73] rounded-xl text-base font-medium">
        View all Paluwagan groups
      </button>  
    </div>
  );
};

const data = [
  { month: "Jan", income: 85, contribution: 75 },
  { month: "Feb", income: 86, contribution: 80 },
  { month: "Mar", income: 70, contribution: 60 },
  { month: "Apr", income: 95, contribution: 85 },
  { month: "May", income: 84, contribution: 90 },
  { month: "Jun", income: 75, contribution: 65 },
  { month: "Jul", income: 60, contribution: 55 },
  { month: "Aug", income: 65, contribution: 60 },
  { month: "Sep", income: 78, contribution: 70 },
  { month: "Oct", income: 85, contribution: 78 },
  { month: "Nov", income: 92, contribution: 80 },
  { month: "Dec", income: 98, contribution: 85 },
];

const AnalyticsChart = () => {
  return (
        <div className="w-[758px] bg-white rounded-[20px] shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#3A6953] text-[26px] font-bold">Analytics</h2>
        <div className="relative">
          <select className="appearance-none border border-[#99C6A9] pl-4 pr-10 py-2 rounded-full text-[15px] font-medium focus:outline-none">
            <option>2020</option>
            <option>2021</option>
            <option>2022</option>
            <option>2023</option>
            <option>2024</option>
            <option>2025</option>
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[#3a6953]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}K`} />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="income" 
            fill="#7FC8A9" 
            barSize={10} 
            name="Income" 
            radius={[10, 10, 0, 0]} 
          />
          <Bar 
            dataKey="contribution" 
            fill="#FF9AA2" 
            barSize={10} 
            name="Contribution" 
            radius={[10, 10, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const transactions = [
  {
    name: "You deposited in your wallet",
    date: "Sat, 20 Apr 2020",
    amount: "₱80.09",
    status: "Deposited",
  },
  {
    name: "You deposited in your wallet",
    date: "Fri, 19 Apr 2020",
    amount: "₱180.09",
    status: "Deposited",
  },
  {
    name: "You deposited in your wallet",
    date: "Mon, 15 Apr 2020",
    amount: "₱410.09",
    status: "Deposited",
  },
  {
    name: "You deposited in your wallet",
    date: "Mon, 15 Apr 2020",
    amount: "₱250.09",
    status: "Deposited",
  },
];

const RecentTransactions = () => {
  return (
    <div className=" w-[758px] bg-white rounded-[20px] shadow-md p-6 mt-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#3A6953] text-[26px] font-bold">Recent Transactions</h2>
        <button className="bg-[#89A598] text-white px-4 py-2 rounded-lg hover:bg-[#D4E8DB] transition">
          View More
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="pb-3">Name</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index} className="border-b last:border-none">
                <td className="py-3">{transaction.name}</td>
                <td className="py-3">{transaction.date}</td>
                <td className="py-3">{transaction.amount}</td>
                <td className="py-3">
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="p-2 flex justify-center">
      <div className="grid grid-cols-3 gap-8 max-w-[1500px]">
        <div className="ml-[20px] : ml-[15px] col-span-2">
          <h1 className="text-4xl font-bold text-[#285236] mb-2">Welcome Back, Ali</h1>
          <p className="text-[#6A8C73] font-normal mb-6">
            Here’s what’s happening with your Paluwagan today.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* Total Income Card */}
            <div className="w-[365px] h-[120px] bg-white rounded-[20px] shadow-md p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-[45px] h-[45px] flex items-center justify-center bg-[#6a8c73] rounded-[10px]">
                  <GoArrowDownLeft className="w-5 h-5 text-white" />
                </div>
                <div className="ml-5">
                  <div className="text-[#285236] text-base font-normal">Total Income</div>
                  <div className="text-[#3a6953] text-2xl font-normal">₱632,000</div>
                </div>
              </div>
              <div className="text-[#285236] bg-[#E5F8ED] px-3 py-1 rounded-full text-sm">
                +1.29%
              </div>
            </div>

            {/* Total Contribution Card */}
            <div className="w-[365px] h-[120px] bg-white rounded-[20px] shadow-md p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-[45px] h-[45px] flex items-center justify-center bg-[#6a8c73] rounded-[10px]">
                  <GoArrowUpRight className="w-5 h-5 text-white" />
                </div>
                <div className="ml-5">
                  <div className="text-[#285236] text-base font-normal">Total Contribution</div>
                  <div className="text-[#3a6953] text-2xl font-normal">₱632,000</div>
                </div>
              </div>
              <div className="text-[#9B2C2C] bg-[#FBE7E7] px-3 py-1 rounded-full text-sm">
                +1.29%
              </div>
            </div>
          </div>

          <AnalyticsChart />
          <RecentTransactions />
        </div>

        <div className="mt-[97px] flex flex-col items-center">
          <AccountBalanceCard />
          <GroupSlotsCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
