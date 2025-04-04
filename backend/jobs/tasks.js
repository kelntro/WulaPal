import Wallet from '../models/Wallet.js';
import Group from '../models/Group.js';
import MemberNotification from '../models/MemberNotification.js';
import { contribute } from '../services/wulapalService.js';
import { getUSDTFromPHP } from '../utils/exchange.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';


export const handleAutoContribution = async () => {
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
      
          console.log(`✅ [Member: ${memberId}] Notification to confirm contribution sent.`);
        } else {
          await MemberNotification.create({
            userId: memberId,
            groupId: group._id,
            message: `⚠️ Your wallet balance is low. Your ₱${amount} contribution for "${group.name}" is due soon.`,
            type: "low_funds_warning",
          });
      
          console.log(`⚠️ [Member: ${memberId}] Low balance. Warning sent.`);
        }
      }
      
      group.lastContributionDate = now;
      await group.save();
      console.log(`💾 [Group: ${group.name}] lastContributionDate updated.\n`);
    }
  
    console.log("✅ [AutoContribution] Finished processing all groups.\n");
  };
  
  
  export const confirmPendingPayments = async () => {
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
  
  

  export const handleAutoPayouts = async () => {
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
  
      const totalPayout = Number(group.contributionAmount) * (group.requiredMembers - 1);
      recipient.balance += totalPayout;
      await recipient.save();
  
      // 🔔 Notify recipient
      await MemberNotification.create({
        userId: payout.recipientId,
        message: `🎉 You received a total of ₱${totalPayout} payout from group "${group.name}".`,
        type: "payout_received",
        groupId: group._id,
      });
  
      // 🧾 Log payout as transaction
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
  
      // Reset for next cycle
      group.currentCycleContributions = 0;
      group.currentPayoutIndex += 1;
      // ✅ Check if all cycles are completed
      if (group.currentPayoutIndex >= group.payouts.length) {
        group.status = "completed";

        // Optional: notify all members
        for (const member of group.members) {
          await MemberNotification.create({
            userId: member.userId,
            groupId: group._id,
            message: `✅ Group "${group.name}" has completed all payout cycles.`,
            type: "group_completed"
          });
        }

        console.log(`🏁 [Group: ${group.name}] All payout cycles completed. Group marked as completed.`);
      }
      
      group.lastContributionDate = new Date(Date.now() - 5 * 60 * 1000);
      group.hasStarted = true;
      await group.save();
    }
  
    console.log("✅ [AutoPayouts] Finished processing all groups.\n");
  }
  