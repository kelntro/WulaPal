import React from "react";

const TermsAndConditionsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#E8F2E8] p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#285236]">Terms and Conditions</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[#6A8C73] font-medium mb-4">
            Terms and Conditions for WulaPal
          </p>
          <p className="text-gray-600 mb-4">
            <strong>Effective Date:</strong> May 30, 2025
          </p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700">
              By accessing or using the WulaPal, you confirm that you are at least
              18 years old or have obtained parental/guardian consent and agree to
              be bound by these terms and conditions, as well as any applicable
              laws and regulations.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              2. Use of the Platform
            </h2>
            <h3 className="text-lg font-medium text-[#6A8C73] mt-2">
              2.1 License Grant:
            </h3>
            <p className="text-gray-700">
              WulaPal grants you a limited, non-exclusive, non-transferable,
              revocable license to use the platform for personal, non-commercial
              purposes.
            </p>
            <h3 className="text-lg font-medium text-[#6A8C73] mt-2">
              2.2 Prohibited Activities:
            </h3>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Use the platform for unlawful purposes.</li>
              <li>
                Attempt to reverse engineer, modify, or distribute the platform.
              </li>
              <li>Upload viruses, malware, or other harmful content.</li>
              <li>Violate the rights of other users or third parties.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              3. Account Registration and Security
            </h2>
            <h3 className="text-lg font-medium text-[#6A8C73] mt-2">
              3.1 Account Creation:
            </h3>
            <p className="text-gray-700">
              You may need to create an account to access certain features. You
              are responsible for maintaining the confidentiality of your account
              credentials.
            </p>
            <h3 className="text-lg font-medium text-[#6A8C73] mt-2">
              3.2 Account Responsibility:
            </h3>
            <p className="text-gray-700">
              You agree to notify us immediately of any unauthorized use of your
              account. WulaPal will not be liable for any losses or damages
              arising from unauthorized account access.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              4. Privacy and Data Collection
            </h2>
            <p className="text-gray-700">
              WulaPal values and upholds your right to data privacy. We collect and process personal information in accordance with Republic Act No. 10173, also known as the Data Privacy Act of 2012.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              5. Intellectual Property
            </h2>
            <p className="text-gray-700">
              All content, features, and functionalities of the platform,
              including text, graphics, logos, and software, are owned by WulaPal
              or its licensors and are protected by intellectual property laws.
              You may not use this content without prior written permission.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              6. Payments and Subscriptions
            </h2>
            <p className="text-gray-700">
              <strong>6.1 Fees:</strong> Some features of the platform may require
              payment. All fees are disclosed within the platform and are subject
              to change with notice.
            </p>
            <p className="text-gray-700">
              <strong>6.2 Subscriptions:</strong> If the platform offers
              subscription-based services, you agree to recurring charges as
              specified during sign-up. You can manage or cancel subscriptions
              through your subscription settings.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              7. Disclaimer of Warranties
            </h2>
            <p className="text-gray-700">
              The platform is provided on an "as-is" and "as-available" basis.
              WulaPal makes no warranties, express or implied, regarding the
              platforms’s functionality, reliability, or suitability for a
              particular purpose.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              8. Limitation of Liability
            </h2>
            <p className="text-gray-700">
              To the fullest extent permitted by law, WulaPal and its affiliates
              are not liable for any direct, indirect, incidental, or
              consequential damages arising from your use or inability to use the
              platform.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              9. Termination
            </h2>
            <p className="text-gray-700">
              WulaPal reserves the right to suspend or terminate your access to
              the platform at any time, without notice, for violating these terms
              or for any other reason deemed necessary.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              10. Changes to Terms and Conditions
            </h2>
            <p className="text-gray-700">
              WulaPal may update these terms at any time. Changes will be
              communicated via the platform or other appropriate means. Continued
              use of the platform after changes constitute acceptance of the
              updated terms.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              11. Governing Law
            </h2>
            <p className="text-gray-700">
              These terms are governed by and construed in accordance with the
              laws of the Republic of the Philippines, including but not limited
              to the Civil Code, the Electronic Commerce Act (RA 8792), and
              relevant consumer protection and financial regulations. Any disputes
              arising from or relating to the use of this platform shall be
              exclusively resolved in the proper courts of Davao City,
              Philippines.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              12. Financial Transactions and User Control
            </h2>
            <p className="text-gray-700">
              Users (organizers and members) retain full ownership and control
              over their funds. WulaPal serves as an automated facilitator for
              group contributions and payouts using smart contracts. Funds are
              only transferred when authorized by the user or through their opt-in
              to automatic contributions. The platform does not hold user money
              directly.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              13. Smart Contracts and Irreversibility
            </h2>
            <p className="text-gray-700">
              Contributions and payouts are executed via blockchain-based smart
              contracts. Once confirmed, these transactions are irreversible.
              Users (organizers and members) are responsible for ensuring accuracy
              before authorizing any transaction.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              14. Refunds and Disputes
            </h2>
            <p className="text-gray-700">
              All plan purchases and platform fees are final and non-refundable
              unless otherwise stated. For disputes, users (organizers and
              members) may contact support with transaction details for review.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-[#285236]">
              15. Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions or concerns about these terms, please
              contact us at:
            </p>

            <div className="flex flex-col space-y-2">
              <div className="flex">
                <span className="text-[#285236] font-medium w-40">Email:</span>
                <span className="text-gray-700">rams_company@gmail.com</span>
              </div>

              <div className="flex">
                <span className="text-[#285236] font-medium w-40">Phone:</span>
                <span className="text-gray-700">+63 9544852365</span>
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
    </div>
  );
};

export default TermsAndConditionsModal; 