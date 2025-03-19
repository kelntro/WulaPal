import mongoose from "mongoose";
import axios from 'axios';
import { createPaymentIntent } from '../services/paymongoService.js';
import Wallet from "../models/Wallet.js"; // ✅ Import Wallet model

export const depositFunds = async (req, res) => {
    console.log("[DEPOSIT] API HIT: Received a deposit request");

    try {
        let { amount, userId } = req.body;

        // ✅ Validate `amount` and `userId`
        if (!amount || isNaN(amount) || amount <= 0) {
            console.error("[DEPOSIT] Invalid deposit amount:", amount);
            return res.status(400).json({ message: "Invalid deposit amount. Please enter a valid number." });
        }

        if (!userId || typeof userId !== "string") {
            console.error("[DEPOSIT] Missing or invalid User ID:", userId);
            return res.status(400).json({ message: "User ID is required and must be a valid string." });
        }

        console.log("[DEPOSIT] Amount received:", amount);
        console.log("[DEPOSIT] User ID:", userId);

        // ✅ Create PayMongo Payment Intent
        console.log("[DEPOSIT] Creating PayMongo Payment Intent...");
        const paymentIntent = await createPaymentIntent(amount);

        if (!paymentIntent?.data?.id) {
            console.error("[DEPOSIT] Failed to create payment intent.");
            return res.status(500).json({ message: "Payment Intent creation failed. Please try again later." });
        }

        const paymentIntentId = paymentIntent.data.id;
        console.log(`[DEPOSIT] Payment Intent ID: ${paymentIntentId}`);

        // ✅ Create Payment Link
        console.log("[DEPOSIT] Creating Payment Link...");
        let checkoutUrl = null;

        try {
            const paymentLinkResponse = await axios.post(
                "https://api.paymongo.com/v1/links",
                {
                    data: {
                        attributes: {
                            amount: amount * 100, // Convert PHP to centavos
                            description: "WulaPal Deposit",
                            currency: "PHP",
                            payment_method_types: ["gcash", "card"]
                        }
                    }
                },
                {
                    headers: {
                        Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString("base64")}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            checkoutUrl = paymentLinkResponse?.data?.data?.attributes?.checkout_url;
        } catch (error) {
            console.error("[DEPOSIT] Error retrieving checkout URL:", error.response?.data || error.message);
            return res.status(500).json({ message: "Error retrieving checkout URL from PayMongo." });
        }

        if (!checkoutUrl) {
            console.error("[DEPOSIT] Error: No checkout URL received.");
            return res.status(500).json({ message: "Failed to generate payment link. Please try again." });
        }

        console.log("[DEPOSIT] Retrieved Checkout URL:", checkoutUrl);

        // ✅ Fetch wallet or create a new one
        let wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            console.log("[DEPOSIT] No existing wallet found. Creating new wallet...");
            wallet = new Wallet({ userId, balance: 0 });
        }

        // ✅ Update wallet balance
        wallet.balance = (wallet.balance || 0) + Number(amount);
        await wallet.save();

        console.log("[DEPOSIT] Wallet updated successfully. New Balance: ₱", wallet.balance);

        // ✅ Return success response
        return res.status(200).json({ 
            message: "Deposit successful. Payment Link Created.", 
            checkout_url: checkoutUrl,
            balance: wallet.balance 
        });

    } catch (error) {
        console.error("[DEPOSIT] Error processing deposit:", error.response?.data || error.message);
        return res.status(500).json({ message: "Error processing deposit.", error: error.message });
    }
};

export const withdrawFunds = async (req, res) => {
    try {
        const { amount, gcashNumber, userId } = req.body;
        if (!amount || isNaN(amount) || amount <= 0 || !gcashNumber || !userId) {
            return res.status(400).json({ message: "Invalid withdrawal details" });
        }

        console.log(`[WITHDRAW] Processing withdrawal of ₱${amount} to GCash ${gcashNumber} for User ID: ${userId}`);

        // ✅ Check if the user has sufficient balance
        let wallet = await Wallet.findOne({ userId });

        if (!wallet || wallet.balance < amount) {
            console.error("[WITHDRAW] Insufficient balance.");
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // ✅ Deduct the amount from wallet balance
        wallet.balance -= amount;
        await wallet.save();

        console.log("[WITHDRAW] Withdrawal successful. New Balance: ₱", wallet.balance);

        res.status(200).json({ message: "Withdrawal successful", balance: wallet.balance });
    } catch (error) {
        console.error("[WITHDRAW] Error:", error);
        res.status(500).json({ message: "Error processing withdrawal" });
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

