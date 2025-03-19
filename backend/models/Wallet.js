import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true }, // ✅ Ensure userId is an ObjectId
    balance: { type: Number, default: 0 }
});

// ✅ Export correctly
const Wallet = mongoose.model("Wallet", WalletSchema);
export default Wallet;
