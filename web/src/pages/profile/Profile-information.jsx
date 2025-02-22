import React from "react";
import { FaEdit } from "react-icons/fa";
import { FaRegCopy } from "react-icons/fa";

const ProfileInformation = () => {
  return (
    <div className="p-2 min-h-screen flex flex-col items-start ml-[100px] : ml-[60px]">
      <h1 className="text-4xl font-bold text-[#285236]">Profile Information</h1>
      <p className="text-[#6A8C73] mb-4">Here’s your settings for security.</p>
      <div className="w-[calc(100%-0.1rem)] max-w-7xl bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-start relative pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full border-2 border-[#285236] bg-white p-1">
              <img
                src="/assets/Profile.jpg"
                alt="Profile"
                className="w-full h-full rounded-full"
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#285236]">
                Ali Riaz
              </h2>
              <p className="text-[#6A8C73]">Travel Handler</p>
            </div>
          </div>
          <button className="px-6 py-2 bg-[#6A8C73] opacity-100 text-white rounded-2xl hover:bg-[#3A6953] transition flex items-center space-x-2 absolute right-6 top-6">
            <FaEdit />
            <span>Edit</span>
          </button>
        </div>

        <div className="flex justify-between mt-6">
          <div className="w-3/5">
            <h3 className="text-xl font-semibold text-[#285236]">
              Account Information
            </h3>
            <div className="mt-2 flex items-center bg-[#F4F4F4] p-2 rounded-2xl border-2 border-[#3A6953] text-[#285236] justify-between">
              <span>Account Number</span>
              <div className="flex items-center space-x-2">
                <span className="text-[#285236] opacity-60 font-medium">
                  3024982387
                </span>
                <FaRegCopy className="text-gray-500 cursor-pointer" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-[#285236] mt-6">
              Personal Information
            </h3>
            <div className="mt-2 space-y-3">
              {[
                { label: "Fullname", value: "Ali Riaz" },
                { label: "Date of Birth", value: "June 8, 2000" },
                { label: "Country", value: "Philippines" },
                { label: "Username", value: "AliRiaz" },
                { label: "Mobile", value: "+63 915 222 1568" },
                { label: "Email", value: "alisantos@gmail.com" },
                {
                  label: "Address",
                  value:
                    "24 Veloso St. Obrero, Buhangin (Pob.), Davao del Sur, 8000",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between bg-[#F4F4F4] p-2 rounded-2xl border-2 border-[#3A6953] text-[#285236]"
                >
                  <span>{item.label}</span>
                  <span className="text-[#285236] opacity-60">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-2/5 flex justify-end items-center mt-6">
            <img
              src="/assets/info.png"
              alt="Illustration"
              className="w-95 h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInformation;
