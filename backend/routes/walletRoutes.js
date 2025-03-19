const express = require('express');
const { depositFunds, withdrawFunds, getWalletBalance } = require('../controllers/walletController');
const Wallet = require('../models/Wallet');

const router = express.Router();

// ✅ Deposit route
router.post('/deposit', depositFunds);

// ✅ Withdraw route
router.post('/withdraw', withdrawFunds);

// ✅ Fetch user balance
router.get("/balance", getWalletBalance);

module.exports = router; // ✅ Keep using CommonJS for compatibility
