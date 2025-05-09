const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["deposit", "withdraw", "transfer", "receive", "payout_share", "refund"], required: true },
  amount: { type: Number, required: true },
  amountUSDT: { type: Number },
  exchangeRate: { type: Number }, 
  referenceId: { type: String, required: true, unique: true },
  status: { type: String, default: "confirmed" },
  txHash: { type: String }, // ✅ Add this
  metadata: Object,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);
