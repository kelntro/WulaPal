const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Group Name
    contributionAmount: { type: String, required: true }, // Contribution amount
    frequency: { type: String, enum: ["Weekly", "Bi-Weekly", "Monthly"], required: true },
    requiredMembers: { type: Number, required: true }, // How many members needed
    image: { type: String, default: "" }, // Group image URL
    description: { type: String, default: "No description provided." },
    slots: { type: Number, required: true },
    handler: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contractAddress: { type: String, default: "" },
    tokenAddress: { type: String, default: "" },
    hasStarted: { type: Boolean, default: false },

    // ⬇️ Refined member structure
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinDate: { type: Date, default: Date.now }
      }
    ],

    // ⬇️ Payout tracking
    payouts: [
      {
        recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        payoutDate: { type: Date, default: Date.now }
      }
    ],
    startDate: { type: Date },
    nextPayoutDate: { type: Date },
    status: { type: String, enum: ["open", "active", "completed"], default: "open" },
    lastContributionDate: { type: Date },
    currentCycleContributions: { type: Number, default: 0 },
    currentPayoutIndex: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError on hot reload or multiple imports
module.exports = mongoose.models.Group || mongoose.model("Group", GroupSchema);
