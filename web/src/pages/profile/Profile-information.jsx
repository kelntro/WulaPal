import { useContext, useEffect, useState } from "react";
import { FaEdit, FaSave, FaRegCopy } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext.jsx";

const ProfileInformation = () => {
  const { setUser: setContextUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const idTypes = [
    "Philippine National ID (PhilSys)",
    "Passport",
    "Driver's License",
    "SSS ID",
    "GSIS eCard",
    "UMID",
    "Voter's ID",
    "PRC ID",
    "Postal ID",
    "PhilHealth ID",
    "TIN ID",
    "Barangay Certificate with Photo",
  ];

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5050/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // 🛠️ Ensure missing fields are not undefined
      const initializedUser = {
        ...data,
        address: data.address || {},
        emergencyContact: data.emergencyContact || {},
        gender: data.gender || "",
        occupation: data.occupation || "",
        sourceOfFunds: data.sourceOfFunds || "",
      };

      setUser(initializedUser);
      setFormData(initializedUser);
    } catch (error) {
      console.error("❌ Failed to fetch profile:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    // Add validation for mobile numbers
    if (field === 'mobile' || field === 'emergencyContact.mobile') {
      // Allow only numbers and optional + at start
      if (!/^\+?\d*$/.test(value)) {
        return;
      }
      // Limit to exactly 11 digits for Philippines mobile numbers
      if (value.length > 11) {
        return;
      }
    }

    // Add validation for zip code
    if (field === 'address.zipCode') {
      // Allow only numbers and limit to 4 digits for Philippines
      if (!/^\d*$/.test(value) || value.length > 4) {
        return;
      }
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      return alert("Please enter a valid email address.");
    }

    if (formData.mobile && !/^\+?\d*$/.test(formData.mobile)) {
      return alert(
        "Mobile number should only contain numbers and an optional '+' sign."
      );
    }

    const token = localStorage.getItem("token");
    const formDataToSend = new FormData();

    // Append regular fields
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("mobile", formData.mobile || "");
    formDataToSend.append("country", formData.country || "");
    formDataToSend.append("dateofBirth", formData.dateofBirth || "");
    formDataToSend.append("idType", formData.idType || "");
    formDataToSend.append("profileImage", user.profileImage || "");
    formDataToSend.append("gender", formData.gender || "");
    formDataToSend.append("occupation", formData.occupation || "");
    formDataToSend.append("sourceOfFunds", formData.sourceOfFunds || "");

    // Append nested address and emergency contact as JSON strings
    formDataToSend.append("address", JSON.stringify(formData.address || {}));
    formDataToSend.append(
      "emergencyContact",
      JSON.stringify(formData.emergencyContact || {})
    );

    // Append ID file only if available
    if (formData.idImageFile) {
      formDataToSend.append("idImageFile", formData.idImageFile);
    }

    const res = await fetch("http://localhost:5050/api/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formDataToSend,
    });

    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      setContextUser(data.user);
      setFormData(data.user);
      setIsEditing(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    } else {
      console.warn("❌ Save failed:", data);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const token = localStorage.getItem("token");
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    const res = await fetch("http://localhost:5050/api/profile/upload-image", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formDataUpload,
    });

    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      setContextUser(data.user); // ✅ update context after image upload too
    }
    setUploading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(user.userId).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-2 min-h-screen flex flex-col items-start ml-[115px]">
      <h1 className="text-4xl font-bold text-[#285236]">Profile Information</h1>
      <p className="text-[#6A8C73] mb-4">Here's your profile information.</p>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center">
            <img
              src="/assets/success.gif"
              alt="Success"
              className="w-24 h-24 mb-4"
            />{" "}
            {/* optional image */}
            <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
            <p className="text-gray-600">Profile updated successfully.</p>
          </div>
        </div>
      )}

      <div className="w-[calc(100%-0.1rem)] max-w-7xl bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-start relative pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full border-2 border-[#6A8C73] relative overflow-hidden cursor-pointer">
              <img
                src={
                  user.profileImage &&
                  user.profileImage !== "null" &&
                  user.profileImage !== ""
                    ? user.profileImage.startsWith("http")
                      ? user.profileImage
                      : `http://localhost:5050${user.profileImage}`
                    : "/assets/Profile.jpg"
                }
                onError={(e) => {
                  console.warn(
                    "❌ Failed to load user profile image:",
                    user.profileImage
                  );
                  e.target.onerror = null;
                  e.target.src = "/assets/Profile.jpg";
                }}
                referrerPolicy="no-referrer"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                onClick={() => {
                  if (isEditing) {
                    document.getElementById("uploadInput").click();
                  }
                }}
                style={{ cursor: isEditing ? "pointer" : "default" }}
              />

              <input
                type="file"
                id="uploadInput"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
              {uploading && (
                <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center text-sm">
                  Uploading...
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#285236]">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="border-b border-gray-300 focus:border-green-600 focus:outline-none"
                  />
                ) : (
                  user.name
                )}
              </h2>
              <p className="text-[#6A8C73] capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="px-6 py-2 bg-[#6A8C73] text-white rounded-2xl hover:bg-[#3A6953] transition flex items-center space-x-2 absolute right-6 top-6"
          >
            {isEditing ? <FaSave /> : <FaEdit />}
            <span>{isEditing ? "Save" : "Edit"}</span>
          </button>
        </div>

        <div className="flex justify-between mt-6">
          <div className="w-3/5">
            <h3 className="text-xl font-semibold text-[#3a6953]">
              Account Information
            </h3>
            <div className="mt-2 flex items-center bg-[#F4F4F4] p-3 rounded-2xl border border-[#6a8c73] text-[#285236] justify-between">
              <span>Account Number</span>
              <div className="flex items-center space-x-2">
                <span className="text-[#285236] opacity-60 font-medium">
                  {user._id}
                </span>
                <FaRegCopy
                  className="text-gray-500 cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(user._id);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  }}
                  title="Copy"
                />
                {copySuccess && (
                  <span className="text-xs text-green-500">Copied!</span>
                )}
              </div>
            </div>

            <h3 className="text-xl font-semibold text-[#3a6953] mt-6">
              Personal Information
            </h3>
            {/* GENDER DROPDOWN */}
            <div className="flex justify-between items-center bg-[#F4F4F4] p-3 rounded-2xl border border-[#6a8c73] text-[#285236]">
              <span>Gender</span>
              {isEditing ? (
                <select
                  value={formData.gender || ""}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="bg-transparent text-center outline-none"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <span className="text-[#285236] opacity-60 text-right">
                  {user.gender || "—"}
                </span>
              )}
            </div>
            <div className="mt-2 space-y-3">
              {[
                { label: "Date of Birth", key: "dateofBirth", type: "date" },
                { label: "Country", key: "country", type: "text" },
                { label: "Mobile", key: "mobile", type: "tel" },
                { label: "Email", key: "email", type: "email", disabled: true },
                { label: "Occupation", key: "occupation", type: "text" },
                {
                  label: "Source of Funds",
                  key: "sourceOfFunds",
                  type: "text",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-[#F4F4F4] p-3 rounded-2xl border border-[#6a8c73] text-[#285236]"
                >
                  <span>{item.label}</span>
                  {isEditing ? (
                    <input
                      type={item.type}
                      value={
                        item.key === "dateofBirth"
                          ? formData[item.key]?.split("T")[0] || ""
                          : formData[item.key] || ""
                      }
                      onChange={(e) => handleChange(item.key, e.target.value)}
                      className="text-right bg-transparent border-none outline-none text-[#285236] opacity-60 w-[200px]"
                      disabled={item.key === "email"}
                    />
                  ) : (
                    <span className="text-[#285236] opacity-60 text-right">
                      {item.key === "dateofBirth" && user[item.key]
                        ? new Date(user[item.key]).toLocaleDateString()
                        : user[item.key] || "—"}
                    </span>
                  )}
                </div>
              ))}
              <h3 className="text-xl font-semibold text-[#3a6953] mt-6">
                Emergency Contact
              </h3>
              {["name", "mobile"].map((field, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-[#F4F4F4] p-3 rounded-2xl border border-[#6a8c73] text-[#285236]"
                >
                  <span className="capitalize">{field}</span>
                  {isEditing ? (
                    <input
                      type={field === "mobile" ? "tel" : "text"}
                      value={formData.emergencyContact?.[field] || ""}
                      onChange={(e) =>
                        handleChange(
                          `emergencyContact.${field}`,
                          e.target.value
                        )
                      }
                      className="text-right bg-transparent border-none outline-none text-[#285236] opacity-60 w-[200px]"
                    />
                  ) : (
                    <span className="text-[#285236] opacity-60 text-right">
                      {user.emergencyContact?.[field] || "—"}
                    </span>
                  )}
                </div>
              ))}
              <h3 className="text-xl font-semibold text-[#3a6953] mt-6">
                Address
              </h3>
              <div className="mt-2 space-y-3">
                {["street", "barangay", "city", "province", "zipCode"].map(
                  (field, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-[#F4F4F4] p-3 rounded-2xl border border-[#6a8c73] text-[#285236]"
                    >
                      <span className="capitalize">{field}</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.address?.[field] || ""}
                          onChange={(e) =>
                            handleChange(
                              `address.${field}`,
                              e.target.value
                            )
                          }
                          className="text-right bg-transparent border-none outline-none text-[#285236] opacity-60 w-[200px]"
                        />
                      ) : (
                        <span className="text-[#285236] opacity-60 text-right">
                          {user.address?.[field] || "—"}
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-[#3a6953]">
                  Government ID
                </h3>

                {/* ID Type */}
                <div className="flex justify-between items-center bg-[#F4F4F4] p-3 rounded-2xl border border-[#6a8c73] text-[#285236] mt-3">
                  <span>ID Type</span>
                  {isEditing ? (
                    <select
                      value={formData.idType || ""}
                      onChange={(e) => handleChange("idType", e.target.value)}
                      className="bg-transparent text-center outline-none"
                    >
                      <option value="">Select</option>
                      {idTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-[#285236] opacity-60 text-right">
                      {user.idType || "—"}
                    </span>
                  )}
                </div>

                {/* ID Upload */}
                <div className="flex flex-col mt-3">
                  <label className="text-sm mb-1">Upload ID Image</label>
                  {isEditing ? (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleChange("idImageFile", e.target.files[0])
                        }
                      />
                      {formData.idImageFile && (
                        <img
                          src={URL.createObjectURL(formData.idImageFile)}
                          alt="ID Preview"
                          className="w-32 h-32 rounded-lg mt-2 object-cover border"
                        />
                      )}
                    </>
                  ) : user.idImage ? (
                    <img
                      src={
                        user.idImage.startsWith("http")
                          ? user.idImage
                          : `http://localhost:5050${user.idImage}`
                      }
                      alt="Uploaded ID"
                      className="w-32 h-32 rounded-lg mt-2 object-cover border"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/id-placeholder.jpg";
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 mt-2">No ID uploaded</p>
                  )}
                </div>
              </div>
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
