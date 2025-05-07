const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    profileImage: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["organizer", "member", "superadmin"], required: true },
    dateofBirth: { type: Date, default: null },
    country: { type: String, default: null },
    mobile: { type: String, default: null },
    email: { type: String, required: true, trim: true },
    pinCode: { type: String, default: null },
    address: {
      street: { type: String, default: null },
      barangay: { type: String, default: null },
      city: { type: String, default: null },
      province: { type: String, default: null },
      zipCode: { type: String, default: null },
    },    
    password: { type: String, required: true },
    fcmToken: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: null },
    occupation: { type: String, default: null },
    sourceOfFunds: { type: String, default: null },
    idType: { type: String, default: null },
    idImage: { type: String, default: null },
    emergencyContact: {
      name: { type: String, default: null },
      mobile: { type: String, default: null }
    },
    plan: {
      type: String,
      enum: ["Free", "Basic", "Pro"],
      default: "Free",
    },
    planExpirationDate: {
      type: Date,
      default: null
    },
    activeGroupsCount: {
      type: Number,
      default: 0
    },
    maxActiveGroups: {
      type: Number,
      default: 1 // Default for Free plan
    },
    lastActive: {
      type: Date,
      default: Date.now
    }    
  },
  { timestamps: true }
);

// ✅ Allow same email with different role (composite unique index)
userSchema.index({ email: 1, role: 1 }, { unique: true });

// Pre-save hook to update maxActiveGroups based on plan
userSchema.pre('save', function(next) {
  if (this.isModified('plan')) {
    switch (this.plan) {
      case 'Free':
        this.maxActiveGroups = 1;
        break;
      case 'Basic':
        this.maxActiveGroups = 5;
        break;
      case 'Pro':
        this.maxActiveGroups = Infinity;
        break;
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
