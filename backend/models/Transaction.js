const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["deposit", "withdraw", "transfer"], required: true },
  amount: { type: Number, required: true },
  amountUSDT: { type: Number },
  exchangeRate: { type: Number }, 
  referenceId: { type: String, required: true, unique: true },
  status: { type: String, default: "confirmed" },
  timestamp: { type: Date, default: Date.now },
  metadata: Object // optional, for things like recipient info or channel
});

module.exports = mongoose.model("Transaction", transactionSchema);
