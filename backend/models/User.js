const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    profileImage: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["organizer", "member"], required: true },
    dateofBirth: { type: Date, default: null },
    country: { type: String, default: null },
    mobile: { type: String, default: null },
    email: { type: String, required: true, trim: true },
    address: { type: String, default: null },
    password: { type: String, required: true },
    fcmToken: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    plan: {
      type: String,
      enum: ["Free", "Basic", "Pro"],
      default: "Free",
    }
    
  },
  { timestamps: true }
);

// ✅ Allow same email with different role (composite unique index)
userSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
