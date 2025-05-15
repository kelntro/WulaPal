import React from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 min-h-screen flex flex-col items-start ml-[90px]">
      {/* Header Section */}
      <div className="w-full max-w-8xl bg-[#E8F2E8] p-3 rounded-lg flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center bg-[#6A8C73] text-white px-6 py-2 rounded-2xl shadow-md hover:bg-[#285236] transition"
        >
          <HiArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold text-[#285236] ml-4">
          Privacy Policy
        </h1>
      </div>

      {/* Main Content */}
      <div className="w-[calc(100%-0.1rem)] max-w-8xl bg-white p-6 rounded-lg shadow-md mt-6">
        <p className="text-[#6A8C73] font-medium mb-4">
          Privacy Policy for WulaPal
        </p>
        <p className="text-gray-600 mb-4">
          <strong>Effective Date:</strong> May 30, 2025
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            1. Information We Collect
          </h2>
          <ul className="list-disc pl-5 text-gray-700">
            <li>
              Personal details: Name, Birthdate, Gender, Address, Mobile number,
              and Email
            </li>
            <li>Verification data: Profile image, and Government-issued ID</li>
            <li>
              Financial activity: Wallet transactions, Group contributions, and
              Payouts
            </li>
            <li>
              Device and session data: IP address, Browser type, and Timestamps
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 text-gray-700">
            <li>To create and manage accounts</li>
            <li>To automate contributions and payouts</li>
            <li>To provide user support and send notifications</li>
            <li>To comply with KYC/AML requirements</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            3. User Control Over Funds
          </h2>
          <p className="text-gray-700">
            Users (organizers and members) always maintain control over their
            wallet balances. WulaPal cannot move, withdraw, or access user funds
            without explicit user consent through platform actions.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            4. Legal Compliance
          </h2>
          <p className="text-gray-700">We comply with:</p>
          <ul className="list-disc pl-5 text-gray-700">
            <li>
              <strong>RA 10173 - Data Privacy Act of 2012</strong>
            </li>
            <li>
              <strong>RA 8792 - E-Commerce Act of 2000</strong>
            </li>
            <li>
              <strong>BSP E-Money & KYC Guidelines</strong>
            </li>
          </ul>
          <p className="text-gray-700">
            You may contact the{" "}
            <a
              className="text-[#285236] underline"
              href="https://privacy.gov.ph"
              target="_blank"
              rel="noopener noreferrer"
            >
              National Privacy Commission (NPC)
            </a>{" "}
            for any violations of your data rights.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            5. Your Rights
          </h2>
          <ul className="list-disc pl-5 text-gray-700">
            <li>Access, update, or delete your personal data</li>
            <li>Withdraw consent to data processing</li>
            <li>Request account deletion</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            6. Data Protection Measures
          </h2>
          <p className="text-gray-700">
            Your data is stored securely using encryption, access controls, and
            secure hosting practices. While we take every precaution, no system
            is completely immune to breaches.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">7. Updates</h2>
          <p className="text-gray-700">
            This Privacy Policy may be updated at any time. We will notify you
            through the platform or email. Continued use of the platform after
            changes indicates your agreement.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            8. Contact Us
          </h2>
          <p className="text-gray-700 mb-4">
            If you have any questions or concerns about these policies, please
            contact us at:
          </p>

          <div className="flex flex-col space-y-2">
            <div className="flex">
              <span className="text-[#285236] font-medium w-40">Email:</span>
              <span className="text-gray-700">rams_company@gmail.com</span>
            </div>

            <div className="flex">
              <span className="text-[#285236] font-medium w-40">Phone:</span>
              <span className="text-gray-700">09544852365</span>
            </div>

            <div className="flex">
              <span className="text-[#285236] font-medium w-40">
                Office Address:
              </span>
              <span className="text-gray-700">
                57 Building 2, Generoso St., Obrero, Buhangin (Pob.), Davao
                City, Davao del Sur, 8000
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
