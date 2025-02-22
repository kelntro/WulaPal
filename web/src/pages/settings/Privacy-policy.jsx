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
          Terms and Conditions for WulaPal System Web
        </p>
        <p className="text-gray-600 mb-4">
          <strong>Effective Date:</strong> [Insert Date]
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-700">
            By accessing or using the App, you confirm that you are at least 18
            years old or have obtained parental/guardian consent and agree to be
            bound by these terms and conditions, as well as any applicable laws
            and regulations.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            2. Use of the App
          </h2>
          <h3 className="text-lg font-medium text-[#6A8C73] mt-2">
            2.1 License Grant:
          </h3>
          <p className="text-gray-700">
            Wulapal grants you a limited, non-exclusive, non-transferable,
            revocable license to use the App for personal, non-commercial
            purposes.
          </p>
          <h3 className="text-lg font-medium text-[#6A8C73] mt-2">
            2.2 Prohibited Activities:
          </h3>
          <ul className="list-disc pl-5 text-gray-700">
            <li>Use the App for unlawful purposes.</li>
            <li>Attempt to reverse engineer, modify, or distribute the App.</li>
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
            account. Wulapal will not be liable for any losses or damages
            arising from unauthorized account access.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            4. Privacy and Data Collection
          </h2>
          <p className="text-gray-700">
            Wulapal values your privacy. Please review our{" "}
            <a href="/privacy-policy" className="text-[#285236] underline">
              Privacy Policy
            </a>{" "}
            for details on how we collect, use, and protect your personal
            information.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            5. Intellectual Property
          </h2>
          <p className="text-gray-700">
            All content, features, and functionalities of the App, including
            text, graphics, logos, and software, are owned by Wulapal or its
            licensors and are protected by intellectual property laws. You may
            not use this content without prior written permission.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            6. Payments and Subscriptions
          </h2>
          <p className="text-gray-700">
            <strong>6.1 Fees:</strong> Some features of the App may require
            payment. All fees are disclosed within the App and are subject to
            change with notice.
          </p>
          <p className="text-gray-700">
            <strong>6.2 Subscriptions:</strong> If the App offers
            subscription-based services, you agree to recurring charges as
            specified during sign-up. You can manage or cancel subscriptions
            through your account settings.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            7. Disclaimer of Warranties
          </h2>
          <p className="text-gray-700">
            The App is provided on an "as-is" and "as-available" basis. Wulapal
            makes no warranties, express or implied, regarding the App’s
            functionality, reliability, or suitability for a particular purpose.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            8. Limitation of Liability
          </h2>
          <p className="text-gray-700">
            To the fullest extent permitted by law, Wulapal and its affiliates
            are not liable for any direct, indirect, incidental, or
            consequential damages arising from your use or inability to use the
            App.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            9. Termination
          </h2>
          <p className="text-gray-700">
            Wulapal reserves the right to suspend or terminate your access to
            the App at any time, without notice, for violating these terms or
            for any other reason deemed necessary.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            10. Changes to Terms and Conditions
          </h2>
          <p className="text-gray-700">
            Wulapal may update these terms at any time. Changes will be
            communicated via the App or other appropriate means. Continued use
            of the App after changes constitute acceptance of the updated terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            11. Governing Law
          </h2>
          <p className="text-gray-700">
            These terms are governed by and construed by the laws of [Insert
            Jurisdiction]. Any disputes will be subject to the exclusive
            jurisdiction of the courts in [Insert Jurisdiction].
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#285236]">
            12. Contact Us
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
