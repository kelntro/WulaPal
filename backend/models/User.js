const mongoose = require("mongoose");

const generateUserId = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
      default: generateUserId,
    },
    profileImage: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["organizer", "member"], required: true },
    dateofBirth: { type: Date, default: null },
    country: { type: String, default: null },
    mobile: { type: String, default: null },
    email: { type: String, unique: true, required: true, trim: true },
    address: { type: String, default: null },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
