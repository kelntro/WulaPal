const Wallet = require('../models/Wallet');
const Group = require('../models/Group');
const MemberNotification = require('../models/MemberNotification');
const { contribute } = require('../services/wulapalService');
const { getUSDTFromPHP } = require('../utils/exchange');
const Transaction = require('../models/Transaction');
const { sendPushToUser } = require('../services/pushService');
const mongoose = require('mongoose');


const handleAutoContribution = async () => {
    console.log("▶️ [AutoContribution] Started running...");
  
    const groups = await Group.find({ status: "active" });
    console.log(`📦 [AutoContribution] Found ${groups.length} active groups`);
  
    for (const group of groups) {
      console.log(`➡️ [Group: ${group.name}] Checking contribution timing...`);
  
      const now = new Date();
      const last = group.lastContributionDate || group.createdAt;
      const expectedContributions = group.requiredMembers - 1;

      // ✅ Only allow first-time cycle to trigger based on time
      if (!group.hasStarted) {
        const minuteDifference = Math.floor((now - (group.lastContributionDate || group.createdAt)) / (1000 * 60));
        
        if (minuteDifference >= 5) {
          console.log(`🚀 [Group: ${group.name}] First contribution cycle is starting now.`);
          group.hasStarted = true;
          await group.save();

          // ✅ Notify the organizer that group started
          await Notification.create({
            organizerId: group.handler,  // Directly use the ID
            message: `🚀 Contribution cycle started for group "${group.name}".`,
          });
          
          io.emit("groupUpdated", {
            organizerId: group.handler.toString(),
            message: `🚀 Contribution cycle started for group "${group.name}".`,
            date: new Date(),
          });

          
        } else {
          console.log(`⏳ [Group: ${group.name}] Waiting 5 minutes before first contribution cycle. Passed: ${minuteDifference}/5`);
          continue;
        }
      }

      if (group.hasStarted && group.currentCycleContributions >= expectedContributions) {
        console.log(`⏳ [Group: ${group.name}] All contributions received. Waiting for payout to be processed.`);
        continue; // Don't notify again once contributions are done
      }

      console.log(`✅ [Group: ${group.name}] Time to check members for contributions.`);
  
      const payout = group.payouts[group.currentPayoutIndex || 0];
      const payoutRecipientId = payout?.recipientId?.toString();
  
      for (const member of group.members) {
        const memberId = member.userId.toString();
        console.log(`🔍 [Debug] Processing member ${memberId}`);
      
        if (memberId === payoutRecipientId) {
          console.log(`⏭️ [Member: ${memberId}] Skipping payout recipient.`);
          continue;
        }
      
        // 🛑 Check if this member already confirmed in this cycle
        const alreadyConfirmed = await MemberNotification.exists({
          userId: memberId,
          groupId: group._id,
          type: "contribution_confirmed",
          processed: false
        });
      
        if (alreadyConfirmed) {
          console.log(`🔁 [Member: ${memberId}] Already confirmed contribution for this cycle.`);
          continue;
        }
      
        const wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(memberId) });
        if (!wallet) {
          console.log(`❌ [Member: ${memberId}] Wallet not found.`);
          continue;
        }
      
        const amount = Number(group.contributionAmount);
        console.log(`💰 [Member: ${memberId}] Wallet balance: ₱${wallet.balance}`);
      
        if (wallet.balance >= amount) {
          await MemberNotification.create({
            userId: memberId,
            groupId: group._id,
            message: `✅ You have enough funds to contribute ₱${amount} for "${group.name}". Confirm in your dashboard.`,
            type: "confirmation_request",
          });
      
          await sendPushToUser(
            memberId,
            "WulaPal",
            `✅ You have enough funds to contribute ₱${amount} to "${group.name}". Confirm now.`
          );

          console.log(`✅ [Member: ${memberId}] Notification to confirm contribution sent.`);
        } else {
          await MemberNotification.create({
            userId: memberId,
            groupId: group._id,
            message: `⚠️ Your wallet balance is low. Your ₱${amount} contribution for "${group.name}" is due soon.`,
            type: "low_funds_warning",
          });
      
          await sendPushToUser(
            memberId,
            "WulaPal",
            `⚠️ Your wallet is low. You need ₱${amount} to contribute in "${group.name}".`
          );
          console.log(`⚠️ [Member: ${memberId}] Low balance. Warning sent.`);
        }
      }
      
      group.lastContributionDate = now;
      await group.save();
      console.log(`💾 [Group: ${group.name}] lastContributionDate updated.\n`);
    }
  
    console.log("✅ [AutoContribution] Finished processing all groups.\n");
  };
  
  
  const confirmPendingPayments = async () => {
    console.log("▶️ [ConfirmPayments] Starting check for pending confirmed contributions...");
  
    const groups = await Group.find({ status: "active" });
    console.log(`📦 [ConfirmPayments] Found ${groups.length} active groups`);
  
    for (const group of groups) {
      console.log(`➡️ [Group: ${group.name}] Checking confirmed contributions...`);
  
      const confirmedUsers = await MemberNotification.find({
        type: "contribution_confirmed",
        groupId: group._id,
        processed: { $ne: true }
      });
  
      if (confirmedUsers.length === 0) {
        console.log(`ℹ️ [Group: ${group.name}] No pending confirmed contributions.`);
        continue;
      }
  
      console.log(`✅ [Group: ${group.name}] Found ${confirmedUsers.length} confirmed contributions to process`);
  
      for (const confirm of confirmedUsers) {
        const wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(confirm.userId) });
        if (!wallet) {
          console.log(`❌ [User: ${confirm.userId}] Wallet not found`);
          continue;
        }
      
        const amountPHP = Number(group.contributionAmount);
        if (wallet.balance < amountPHP) {
          console.log(`⚠️ [User: ${confirm.userId}] Insufficient funds despite confirmation`);
          continue;
        }
      
        // 🔁 Convert PHP to USDT once
        const { usdtAmount, rate } = await getUSDTFromPHP(amountPHP);
      
        // 💸 Send to blockchain
        await contribute(group.contractAddress, group.tokenAddress, usdtAmount);
      
        // 💰 Deduct and save wallet
        wallet.balance -= amountPHP;
        await wallet.save();
      
        // 📊 Update group progress
        group.currentCycleContributions += 1;
      
        // ✅ Mark as processed
        confirm.processed = true;
        await confirm.save();
      
        // 🔔 Member notification
        await MemberNotification.create({
          userId: confirm.userId,
          message: `✅ You contributed ₱${amountPHP} to "${group.name}". Exchange rate: ₱${rate} = 1 USDT.`,
          type: "contribution_processed",
          groupId: group._id,
        });

        await sendPushToUser(
          confirm.userId.toString(),
          "WulaPal",
          `✅ You contributed ₱${amountPHP} to "${group.name}".`
        );
      
        // 🧾 Log transaction
        const referenceId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        await Transaction.create({
          userId: confirm.userId,
          type: "transfer",
          amount: amountPHP,
          amountUSDT: usdtAmount,
          exchangeRate: rate,
          referenceId,
          metadata: {
            to: `Group: ${group.name}`,
            groupId: group._id.toString(),
          },
          status: "confirmed",
        });
      
        console.log(`💸 [User: ${confirm.userId}] Contribution logged. ₱${amountPHP} sent to smart contract.`);
      }      
  
      if (group.currentCycleContributions > 0) {
        group.lastContributionDate = new Date();
        await group.save();
        console.log(`💾 [Group: ${group.name}] Contribution count updated and lastContributionDate set.`);
      }
    }
  
    console.log("✅ [ConfirmPayments] Finished processing all groups.\n");
  };
  
  
  const handleAutoPayouts = async () => {
    console.log("▶️ [AutoPayouts] Starting payout checks...");
  
    const groups = await Group.find({ status: "active" });
    console.log(`📦 [AutoPayouts] Found ${groups.length} active groups`);
  
    for (const group of groups) {
      const payoutIndex = group.currentPayoutIndex || 0;
      const expectedContributions = group.requiredMembers - 1;
  
      console.log(`➡️ [Group: ${group.name}] Checking if current cycle is ready for payout...`);
      console.log(`   ↳ Contributions: ${group.currentCycleContributions}/${expectedContributions}`);
  
      if (group.currentCycleContributions < expectedContributions) {
        console.log(`⏳ [Group: ${group.name}] Not enough contributions yet.`);
        continue;
      }
  
      const payout = group.payouts?.[payoutIndex];
      if (!payout) {
        console.log(`❌ [Group: ${group.name}] No payout data found at index ${payoutIndex}`);
        continue;
      }
  
      const recipient = await Wallet.findOne({ userId: payout.recipientId });
      if (!recipient) {
        console.log(`❌ [User: ${payout.recipientId}] Wallet not found. Skipping payout.`);
        continue;
      }
  
      const totalPayout = Number(group.contributionAmount) * expectedContributions;
      recipient.balance += totalPayout;
      await recipient.save();
  
      await MemberNotification.create({
        userId: payout.recipientId,
        message: `🎉 You received a total of ₱${totalPayout} payout from group "${group.name}".`,
        type: "payout_received",
        groupId: group._id,
      });
  
      await sendPushToUser(
        payout.recipientId.toString(),
        "WulaPal",
        `🎉 You received ₱${totalPayout} from group "${group.name}".`
      );
  
      const referenceId = `PAYOUT-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      await Transaction.create({
        userId: payout.recipientId,
        type: "receive",
        amount: totalPayout,
        referenceId,
        metadata: {
          from: `Group: ${group.name}`,
          groupId: group._id.toString(),
          cycle: payoutIndex + 1
        },
        status: "confirmed",
      });
  
      console.log(`🎉 [User: ${payout.recipientId}] Received ₱${totalPayout} from group "${group.name}". Transaction logged.`);
  
      group.currentCycleContributions = 0;
      group.currentPayoutIndex += 1;
  
      if (group.currentPayoutIndex >= group.payouts.length) {
        group.status = "completed";
  
        for (const member of group.members) {
          await MemberNotification.create({
            userId: member.userId,
            groupId: group._id,
            message: `✅ Group "${group.name}" has completed all payout cycles.`,
            type: "group_completed"
          });
  
          await sendPushToUser(
            member.userId.toString(),
            "WulaPal",
            `✅ Group "${group.name}" is now completed. 🎉`
          );
        }
  
        console.log(`🏁 [Group: ${group.name}] All payout cycles completed. Group marked as completed.`);
      }
  
      // ✅ Use proper interval based on group frequency
      let intervalDays = 7;
      if (group.frequency === "Bi-Weekly") intervalDays = 14;
      if (group.frequency === "Monthly") intervalDays = 30;
  
      group.lastContributionDate = new Date(); // reset to now
      group.hasStarted = true;
  
      await group.save();
    }
  
    console.log("✅ [AutoPayouts] Finished processing all groups.\n");
  };
  
  
  const sendUpcomingContributionReminders = async () => {
    const groups = await Group.find({ status: "active", hasStarted: true });
  
    for (const group of groups) {
      const now = new Date();
      const contributionIntervalDays = group.frequency === "Bi-Weekly" ? 14 : group.frequency === "Monthly" ? 30 : 7;
      
      const nextDueDate = new Date(group.lastContributionDate.getTime() + contributionIntervalDays * 24 * 60 * 60 * 1000);
      const oneDayBefore = new Date(nextDueDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  
      const isReminderDay =
        now.getFullYear() === oneDayBefore.getFullYear() &&
        now.getMonth() === oneDayBefore.getMonth() &&
        now.getDate() === oneDayBefore.getDate();
  
      if (!isReminderDay) continue;
  
      for (const member of group.members) {
        const memberId = member.userId.toString();
        const payout = group.payouts[group.currentPayoutIndex || 0];
        const isPayoutRecipient = payout?.recipientId?.toString() === memberId;
        if (isPayoutRecipient) continue;
  
        await MemberNotification.create({
          userId: memberId,
          groupId: group._id,
          type: "contribution_reminder",
          message: `📢 Reminder: Your ₱${group.contributionAmount} contribution for "${group.name}" is due tomorrow.`,
        });
        await sendPushToUser(
          memberId,
          "WulaPal",
          `📢 Reminder: Your ₱${group.contributionAmount} contribution for "${group.name}" is due tomorrow.`
        );
        console.log(`📨 [Reminder] Sent contribution deadline reminder to ${memberId} for "${group.name}"`);
      }
    }
  };
  

  module.exports = {
    handleAutoContribution,
    confirmPendingPayments,
    handleAutoPayouts,
    sendUpcomingContributionReminders
  };