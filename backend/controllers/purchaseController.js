import axios from 'axios';
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const XENDIT_API_KEY = process.env.XENDIT_SECRET_KEY; // ✅ Make sure it's correct

export const createPlanPurchase = async (req, res) => {
    console.log("[PLAN PURCHASE] API HIT: Received a plan purchase request");

    try {
        const { amount, plan, userId, successRedirectURL } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            console.error("[PLAN PURCHASE] Invalid amount:", amount);
            return res.status(400).json({ message: "Invalid plan amount." });
        }

        if (!plan || !userId || !successRedirectURL) {
            console.error("[PLAN PURCHASE] Missing required fields.");
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Set expiration date to 1 year from now
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);

        console.log("[PLAN PURCHASE] Creating Xendit invoice...");
        const ref = `plan-${userId}-${Date.now()}`;

        const invoicePayload = {
            external_id: ref,
            payer_email: `user-${userId}@wulapal.app`,
            description: `Purchase ${plan} Plan on WulaPal`,
            amount: Number(amount),
            currency: "PHP",
            success_redirect_url: successRedirectURL, // ✅ Important! after payment go back to success page
            metadata: {
                userId,
                plan,
                expirationDate: expirationDate.toISOString()
            }
        };

        const response = await axios.post("https://api.xendit.co/v2/invoices", invoicePayload, {
            headers: {
                Authorization: `Basic ${Buffer.from(XENDIT_API_KEY + ":").toString("base64")}`,
                "Content-Type": "application/json",
            },
        });

        const checkoutUrl = response.data.invoice_url;

        if (!checkoutUrl) {
            console.error("[PLAN PURCHASE] No checkout URL returned by Xendit.");
            return res.status(500).json({ message: "Failed to generate payment link. Try again later." });
        }

        console.log("[PLAN PURCHASE] Xendit Invoice Created. Checkout URL:", checkoutUrl);

        return res.status(200).json({
            message: "Plan purchase initiated. Redirecting to payment link.",
            checkout_url: checkoutUrl,
        });
    } catch (error) {
        console.error("[PLAN PURCHASE] Error processing plan purchase:", error.response?.data || error.message);
        return res.status(500).json({
            message: "Error processing plan purchase via Xendit.",
            error: error.message,
        });
    }
};

export const creditSuperadminWallet = async (req, res) => {
    try {
      const { amount, fromUserId } = req.body;
  
      if (!amount || !fromUserId) {
        return res.status(400).json({ message: "Amount and fromUserId required" });
      }
  
      // Find the super admin
      const superadmin = await User.findOne({ role: "superadmin" });
      if (!superadmin) return res.status(404).json({ message: "Superadmin not found" });
  
      const superWallet = await Wallet.findOne({ userId: superadmin._id });
      if (!superWallet) return res.status(404).json({ message: "Superadmin wallet not found" });
  
      // Credit amount
      superWallet.balance += amount;
      await superWallet.save();
  
      // Log transaction
      const ref = `PLAN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      await Transaction.create({
        userId: superadmin._id,
        type: "receive",
        amount,
        referenceId: ref,
        metadata: {
          from: `User: ${fromUserId}`,
          type: "plan_purchase",
        },
        status: "confirmed",
      });
  
      return res.json({ success: true, message: "Superadmin wallet credited" });
    } catch (error) {
      console.error("❌ Error crediting superadmin wallet:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
