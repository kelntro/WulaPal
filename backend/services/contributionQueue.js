const { queueWalletTransaction } = require('./walletQueue');
const { contribute } = require('./wulapalService');
const { getUSDTFromPHP } = require('../utils/exchange');
const Wallet = require('../models/Wallet');
const Group = require('../models/Group');
const MemberNotification = require('../models/MemberNotification');
const Transaction = require('../models/Transaction');
const { sendPushToUser } = require('../services/pushService');

const processContribution = async (userId, groupId, amountPHP) => {
  return queueWalletTransaction(async () => {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Group not found");

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");

    if (wallet.balance < amountPHP) {
      throw new Error("Insufficient balance");
    }

    // Convert PHP to USDT and process contribution
    const { usdtAmount, rate } = await getUSDTFromPHP(amountPHP);
    const result = await contribute(group.contractAddress, group.tokenAddress, usdtAmount);

    if (!result.success) {
      throw new Error(result.error || "Blockchain contribution failed");
    }

    // Deduct from wallet
    wallet.balance -= amountPHP;
    await wallet.save();

    // Update group progress
    group.currentCycleContributions += 1;
    await group.save();

    // Create notification
    await MemberNotification.create({
      userId,
      groupId,
      type: "contribution_processed",
      message: `✅ You contributed ₱${amountPHP} to "${group.name}" (Cycle ${group.currentPayoutIndex + 1}).`,
      processed: true,
      cycle: group.currentPayoutIndex
    });

    // Log transaction
    await Transaction.create({
      userId,
      type: "transfer",
      amount: amountPHP,
      amountUSDT: usdtAmount,
      exchangeRate: rate,
      referenceId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      txHash: result.txHash || null,
      metadata: {
        to: `Group: ${group.name}`,
        groupId: group._id.toString(),
        cycle: group.currentPayoutIndex + 1,
        explorer: result?.txHash ? `https://amoy.polygonscan.com/tx/${result.txHash}` : null
      },
      status: "confirmed"
    });

    // Send push notification
    await sendPushToUser(
      userId.toString(),
      "WulaPal",
      `✅ You contributed ₱${amountPHP} to "${group.name}".`
    );

    return {
      success: true,
      group,
      result
    };
  });
};

module.exports = {
  processContribution
}; 