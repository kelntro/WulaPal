const Wallet = require('../models/Wallet');
const Group = require('../models/Group');
const MemberNotification = require('../models/MemberNotification');
const { getUSDTFromPHP } = require('../utils/exchange');
const Transaction = require('../models/Transaction');
const { sendPushToUser } = require('../services/pushService');
const mongoose = require('mongoose');

const { contribute, triggerPayout } = require('../services/wulapalService');


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
        
        if (minuteDifference >= 1) {
          console.log(`🚀 [Group: ${group.name}] First contribution cycle is starting now.`);
          group.hasStarted = true;
          await group.save();

          // ✅ Notify the organizer that group started
          await Notification.create({
            organizerId: group.handler,
            message: `🚀 Contribution cycle started for group "${group.name}".`,
          });
          
          io.emit("groupUpdated", {
            organizerId: group.handler.toString(),
            message: `🚀 Contribution cycle started for group "${group.name}".`,
            date: new Date(),
          });
          
        } else {
          console.log(`⏳ [Group: ${group.name}] Waiting 1 minute before first contribution cycle. Passed: ${minuteDifference}/1`);
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
      
        // Skip if this member is the current payout recipient
        if (memberId === payoutRecipientId) {
          console.log(`⏭️ [Member: ${memberId}] Skipping payout recipient for cycle ${group.currentPayoutIndex + 1}.`);
          continue;
        }
      
        // Check if this member already confirmed in this cycle
        const alreadyConfirmed = await MemberNotification.exists({
          userId: memberId,
          groupId: group._id,
          type: { $in: ["contribution_confirmed", "contribution_processed"] },
          processed: true,
          cycle: group.currentPayoutIndex
        });
        
        if (alreadyConfirmed) {
          console.log(`🔁 [Member: ${memberId}] Already contributed for cycle ${group.currentPayoutIndex + 1}.`);
          continue;
        }
        
        // Check if we already have enough contributions for this cycle
        const expectedContributions = group.requiredMembers - 1;
        if (group.currentCycleContributions >= expectedContributions) {
          console.log(`✅ [Group: ${group.name}] Already have enough contributions for cycle ${group.currentPayoutIndex + 1}.`);
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
            message: `✅ You have enough funds to contribute ₱${amount} for "${group.name}" (Cycle ${group.currentPayoutIndex + 1}). Confirm in your dashboard.`,
            type: "confirmation_request",
            cycle: group.currentPayoutIndex
          });
      
          await sendPushToUser(
            memberId,
            "WulaPal",
            `✅ You have enough funds to contribute ₱${amount} to "${group.name}" (Cycle ${group.currentPayoutIndex + 1}). Confirm now.`
          );

          console.log(`✅ [Member: ${memberId}] Notification to confirm contribution sent.`);
        } else {
          await MemberNotification.create({
            userId: memberId,
            groupId: group._id,
            message: `⚠️ Your wallet balance is low. Your ₱${amount} contribution for "${group.name}" (Cycle ${group.currentPayoutIndex + 1}) is due soon.`,
            type: "low_funds_warning",
            cycle: group.currentPayoutIndex
          });
      
          await sendPushToUser(
            memberId,
            "WulaPal",
            `⚠️ Your wallet is low. You need ₱${amount} to contribute in "${group.name}" (Cycle ${group.currentPayoutIndex + 1}).`
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
        processed: { $ne: true },
        cycle: group.currentPayoutIndex  // ✅ Filter only for current cycle
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
        const result = await contribute(group.contractAddress, group.tokenAddress, usdtAmount);
      
        // 💰 Deduct and save wallet
        wallet.balance -= amountPHP;
        await wallet.save();
      
        // 📊 Update group progress
        group.currentCycleContributions += 1;

        const expectedContributions = group.requiredMembers - 1;
        if (group.currentCycleContributions >= expectedContributions) {
          console.log(`📦 [Group: ${group.name}] Contribution complete. Triggering payout now.`);
          await group.save(); // Save first
          await handleAutoPayouts(); // Immediate payout
        } else {
          await group.save();
        }

        // ✅ Mark as processed
        confirm.processed = true;
        await confirm.save();
      
        // 🔔 Member notification
        await MemberNotification.create({
          userId: confirm.userId,
          message: `✅ You contributed ₱${amountPHP} to "${group.name}". Exchange rate: ₱${rate} = 1 USDT.`,
          type: "contribution_processed",
          groupId: group._id,
          cycle: group.currentPayoutIndex, // ✅ Add cycle tracking
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
          txHash: result?.txHash || null,
          metadata: {
            to: `Group: ${group.name}`,
            groupId: group._id.toString(),
            method: confirm.message?.includes("early") ? "advance_payment" : "scheduled",
            explorer: result?.txHash ? `https://amoy.polygonscan.com/tx/${result.txHash}` : null
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
  
      console.log(`➡️ [Group: ${group.name}] Checking if current cycle is ready for payout...`);
      console.log(`   ↳ Contributions: ${group.currentCycleContributions}/${expectedContributions}`);
  
      if (payoutIndex >= group.payouts.length) {
        console.log(`✅ [Group: ${group.name}] All payout cycles completed.`);
        group.status = "completed";
        await group.save();
        continue;
      }

      const expectedContributions = group.requiredMembers - 1;
      // Add check for completed payouts
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
  
      const result = await triggerPayout(group.contractAddress);
      if (result.success) {
        console.log(`✅ Blockchain payout triggered for group ${group.name}`);
      
        group.currentCycleContributions = 0;
        group.currentPayoutIndex += 1;

        // ⏭️ Update next payout date
        const nextPayout = group.payouts[group.currentPayoutIndex];
        if (nextPayout?.payoutDate) {
          group.nextPayoutDate = nextPayout.payoutDate;
        }
        await group.save();
      
        // 🔁 Re-evaluate contributions excluding the next payout recipient
        await handleAutoContribution(group);

        // 📣 Notify frontend (Group Contribution Details should update)
        const io = require('../server').get('io');
        io.emit('groupUpdated', {
          groupId: group._id.toString(),
          message: `📢 "${group.name}" updated: new payout recipient assigned.`,
          date: new Date(),
        });

        await MemberNotification.create({
          userId: payout.recipientId,
          message: `🎉 You received your payout from group "${group.name}".`,
          type: "payout_received",
          groupId: group._id,
        });
      
        await sendPushToUser(
          payout.recipientId.toString(),
          "WulaPal",
          `🎉 You received your payout from "${group.name}".`
        );
      
        // ✅ INSERT THIS BLOCK to credit organizer's wallet in MongoDB
        const totalPayoutPHP = Number(group.contributionAmount) * (group.requiredMembers - 1);
        const organizerFee = (totalPayoutPHP * 1) / 100;
      
        const organizerWallet = await Wallet.findOne({ userId: group.handler });
        if (organizerWallet) {
          organizerWallet.balance += organizerFee;
          await organizerWallet.save();
      
          await Transaction.create({
            userId: group.handler,
            type: 'payout_share',
            amount: organizerFee,
            referenceId: `org-share-${Date.now()}`,
            status: 'confirmed',
            txHash: result?.txHash || null,
            metadata: {
              groupId: group._id.toString(),
              from: 'smart_contract',
              note: '1% organizer share from payout'
            }
          });
      
          console.log(`💰 Organizer share of ₱${organizerFee} credited to ${group.handler}`);
        }

        // ✅ Check if group is done
        if (group.currentPayoutIndex >= group.payouts.length) {
          group.status = "completed";
          await group.save();
          
          for (const member of group.members) {
            // 💸 Refund each member's deposit
            if (member.depositAmount > 0) {
              const wallet = await Wallet.findOne({ userId: member.userId });
              if (wallet) {
                wallet.balance += member.depositAmount;
                await wallet.save();
    
                await Transaction.create({
                  userId: member.userId,
                  type: "refund",
                  amount: member.depositAmount,
                  txHash: result?.txHash || null,
                  metadata: {
                    groupId: group._id.toString(),
                    type: "deposit_refund"
                  },
                  status: "confirmed"
                });
    
                await MemberNotification.create({
                  userId: member.userId,
                  groupId: group._id,
                  message: `💰 Your ₱${member.depositAmount} deposit was refunded after group "${group.name}" completed.`,
                  type: "deposit_refunded"
                });
    
                await sendPushToUser(
                  member.userId.toString(),
                  "WulaPal",
                  `💰 Your ₱${member.depositAmount} deposit for group "${group.name}" was refunded.`
                );
    
                console.log(`↩️ [Refund] ₱${member.depositAmount} refunded to ${member.userId}`);
              }
            }
    
            // 📨 Final notification
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
      } else {
        console.log(`❌ Payout failed for group ${group.name}:`, result.error);
      }
  
      // ✅ Update group status/timing
      let intervalDays = 7;
      if (group.frequency === "Bi-Weekly") intervalDays = 14;
      if (group.frequency === "Monthly") intervalDays = 30;
  
      group.lastContributionDate = new Date();
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
  
      const isReminderDay = true;
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
          cycle: group.currentPayoutIndex, // ✅ Add this
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