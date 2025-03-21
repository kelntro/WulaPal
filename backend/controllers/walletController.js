import mongoose from "mongoose";
import axios from 'axios';
import { createPaymentIntent } from '../services/paymongoService.js';
import Wallet from "../models/Wallet.js"; // ✅ Import Wallet model

const XENDIT_API_KEY = process.env.XENDIT_SECRET_KEY;

export const depositFunds = async (req, res) => {
    console.log("[DEPOSIT] API HIT: Received a deposit request");

    try {
        const { amount, userId } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            console.error("[DEPOSIT] Invalid deposit amount:", amount);
            return res.status(400).json({ message: "Invalid deposit amount." });
        }

        if (!userId || typeof userId !== "string") {
            console.error("[DEPOSIT] Invalid user ID:", userId);
            return res.status(400).json({ message: "User ID is required and must be a valid string." });
        }

        console.log("[DEPOSIT] Creating Xendit invoice...");
        const invoicePayload = {
            external_id: `deposit-${userId}-${Date.now()}`,
            payer_email: `user-${userId}@wulapal.app`,
            description: "WulaPal Deposit",
            amount: Number(amount),
            currency: "PHP",
            success_redirect_url: "https://wulapal.app/payment-success", // optional
        };

        const response = await axios.post("https://api.xendit.co/v2/invoices", invoicePayload, {
            headers: {
                Authorization: `Basic ${Buffer.from(XENDIT_API_KEY + ":").toString("base64")}`,
                "Content-Type": "application/json",
            },
        });

        const checkoutUrl = response.data.invoice_url;

        if (!checkoutUrl) {
            console.error("[DEPOSIT] No checkout URL returned by Xendit.");
            return res.status(500).json({ message: "Failed to generate payment link. Try again later." });
        }

        console.log("[DEPOSIT] Xendit Invoice Created. Checkout URL:", checkoutUrl);

        // 📝 In live mode, use webhook to credit wallet after successful payment.
        // For testing, we simulate wallet top-up immediately:
        let wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            console.log("[DEPOSIT] Creating new wallet for user...");
            wallet = new Wallet({ userId, balance: 0 });
        }

        wallet.balance += Number(amount); // ✅ simulate deposit (remove when webhooks are live)
        await wallet.save();

        console.log("[DEPOSIT] Wallet credited. New Balance: ₱", wallet.balance);

        return res.status(200).json({
            message: "Deposit initiated. Redirecting to Xendit payment link.",
            checkout_url: checkoutUrl,
            balance: wallet.balance,
        });
    } catch (error) {
        console.error("[DEPOSIT] Error processing deposit:", error.response?.data || error.message);
        return res.status(500).json({
            message: "Error processing deposit via Xendit.",
            error: error.message,
        });
    }
};

export const withdrawFunds = async (req, res) => {
    console.log("[WITHDRAW] API HIT: Received a withdrawal request");

    try {
        const { amount, mobileNumber, userId, channel } = req.body;

        // ✅ Validate input
        if (!amount || isNaN(amount) || amount <= 0) {
            console.error("[WITHDRAW] Invalid amount:", amount);
            return res.status(400).json({ message: "Invalid amount. Must be a positive number." });
        }

        if (!mobileNumber || typeof mobileNumber !== 'string' || mobileNumber.length < 10) {
            console.error("[WITHDRAW] Invalid mobile number:", mobileNumber);
            return res.status(400).json({ message: "Invalid mobile number." });
        }

        if (!userId || typeof userId !== 'string') {
            console.error("[WITHDRAW] Invalid user ID:", userId);
            return res.status(400).json({ message: "Invalid user ID." });
        }

        if (!channel) {
            console.error("[WITHDRAW] Channel not specified.");
            return res.status(400).json({ message: "Payout channel is required." });
        }

        console.log(`[WITHDRAW] Simulating withdrawal: ₱${amount}, Channel: ${channel}, Mobile: ${mobileNumber}, User: ${userId}`);

        // ✅ Check balance
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            console.error("[WITHDRAW] Wallet not found for userId:", userId);
            return res.status(404).json({ message: "Wallet not found." });
        }

        if (wallet.balance < amount) {
            console.warn(`[WITHDRAW] Insufficient funds. Balance: ₱${wallet.balance}, Requested: ₱${amount}`);
            return res.status(400).json({ message: "Insufficient balance." });
        }

        // ✅ Deduct balance
        wallet.balance -= amount;
        await wallet.save();

        const referenceId = `xendit-${userId}-${Date.now()}`;
        const payoutLog = {
            status: "COMPLETED",
            referenceId,
            targetChannel: channel,
            targetMobile: mobileNumber,
        };

        console.log("[WITHDRAW] ✅ Xendit simulated payout:", payoutLog);

        return res.status(200).json({
            message: "Withdrawal processed successfully (Simulated via Xendit)",
            balance: wallet.balance,
            payout: payoutLog
        });

    } catch (error) {
        console.error("[WITHDRAW] Error:", error.message);
        return res.status(500).json({
            message: "Withdrawal failed.",
            error: error.message
        });
    }
};

export const getWalletBalance = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        console.log(`[BALANCE] Fetching balance for userId: ${userId}`);

        // ✅ Ensure `userId` is an ObjectId when querying MongoDB
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error(`[BALANCE] Invalid userId format: ${userId}`);
            return res.status(400).json({ error: "Invalid User ID format." });
        }

        // ✅ Find Wallet by userId (converted to ObjectId)
        const wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) });

        // ✅ If wallet not found, return balance of 0 instead of error
        if (!wallet) {
            console.warn(`[BALANCE] No wallet found for userId: ${userId}. Returning balance: 0`);
            return res.json({ balance: 0 }); // ✅ Return 0 balance instead of 404 error
        }

        console.log(`[BALANCE] Wallet found. Balance: ₱${wallet.balance}`);
        return res.json({ balance: wallet.balance });

    } catch (error) {
        console.error("[BALANCE] Error fetching balance:", error.message);
        return res.status(500).json({ error: "Error retrieving balance." });
    }
};

