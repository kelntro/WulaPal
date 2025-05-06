const express = require('express');
const { depositFunds, withdrawFunds, transferFunds, getWalletBalance } = require('../controllers/walletController');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

const router = express.Router();

// ✅ Deposit route
router.post('/deposit', depositFunds);

// ✅ Withdraw route
router.post('/withdraw', withdrawFunds);

// ✅ Fetch user balance
router.get("/balance", getWalletBalance);

// ✅ Transfer Route
router.post('/transfer', transferFunds);

router.get('/transactions', async (req, res) => {
    const { userId } = req.query;
  
    if (!userId) return res.status(400).json({ message: "User ID required" });
  
    try {
      const transactions = await Transaction.find({ userId }).sort({ timestamp: -1 }).lean();
      res.json(transactions);
    } catch (err) {
      console.error("[TRANSACTIONS] Error:", err.message);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  

module.exports = router; // ✅ Keep using CommonJS for compatibility
