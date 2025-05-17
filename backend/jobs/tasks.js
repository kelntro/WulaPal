const Wallet = require('../models/Wallet');
const Group = require('../models/Group');
const MemberNotification = require('../models/MemberNotification');
const { getUSDTFromPHP } = require('../utils/exchange');
const Transaction = require('../models/Transaction');
const { sendPushToUser } = require('../services/pushService');
const mongoose = require('mongoose');
const User = require('../models/User');

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
        cycle: group.currentPayoutIndex
      });      
  
      if (confirmedUsers.length === 0) {
        console.log(`ℹ️ [Group: ${group.name}] No pending confirmed contributions.`);
        continue;
      }
  
      console.log(`✅ [Group: ${group.name}] Found ${confirmedUsers.length} confirmed contributions to process`);
  
      for (const confirm of confirmedUsers) {
        console.log(`🔄 [Group: ${group.name}] Processing contribution from user ${confirm.userId}`);
        
        const wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(confirm.userId) });
        if (!wallet) {
          console.log(`❌ [User: ${confirm.userId}] Wallet not found`);
          continue;
        }
      
        const amountPHP = Number(group.contributionAmount);
        console.log(`💰 [User: ${confirm.userId}] Checking balance: ₱${wallet.balance} (Required: ₱${amountPHP})`);
        
        if (wallet.balance < amountPHP) {
          console.log(`⚠️ [User: ${confirm.userId}] Insufficient funds despite confirmation`);
          continue;
        }
      
        // 🔁 Convert PHP to USDT once
        const { usdtAmount, rate } = await getUSDTFromPHP(amountPHP);
        console.log(`💱 [User: ${confirm.userId}] Converting ₱${amountPHP} to ${usdtAmount} USDT (Rate: ₱${rate}/USDT)`);
      
        // 💸 Send to blockchain
        console.log(`🔗 [User: ${confirm.userId}] Sending contribution to smart contract...`);
        const result = await contribute(group.contractAddress, group.tokenAddress, usdtAmount);
        
        if (!result.success) {
          console.log(`❌ [User: ${confirm.userId}] Contribution failed: ${result.error}`);
          continue;
        }
        
        console.log(`✅ [User: ${confirm.userId}] Contribution sent to blockchain. TX: ${result.txHash}`);
      
        // 💰 Deduct and save wallet
        wallet.balance -= amountPHP;
        await wallet.save();
        console.log(`💳 [User: ${confirm.userId}] Updated wallet balance: ₱${wallet.balance}`);
      
        // 📊 Update group progress
        group.currentCycleContributions += 1;
        console.log(`📊 [Group: ${group.name}] Updated contribution count: ${group.currentCycleContributions}/${group.requiredMembers - 1}`);

        const expectedContributions = group.requiredMembers - 1;

        // ✅ Mark as processed
        confirm.processed = true;
        await confirm.save();
        console.log(`✅ [User: ${confirm.userId}] Marked contribution as processed`);
      
        // 🔔 Member notification
        await MemberNotification.create({
          userId: confirm.userId,
          message: `✅ You contributed ₱${amountPHP} to "${group.name}". Exchange rate: ₱${rate} = 1 USDT.`,
          type: "contribution_processed",
          groupId: group._id,
          cycle: group.currentPayoutIndex,
        });        
        console.log(`📨 [User: ${confirm.userId}] Sent contribution confirmation notification`);

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
        console.log(`📝 [User: ${confirm.userId}] Transaction logged with reference: ${referenceId}`);

        // Check if this was the last contribution needed
        if (group.currentCycleContributions >= expectedContributions) {
          console.log(`🎯 [Group: ${group.name}] Last contribution received! Triggering payout immediately...`);
          
          // Save group state before payout
          await group.save();
          
          // Get current payout info
          const payoutIndex = group.currentPayoutIndex || 0;
          const payout = group.payouts?.[payoutIndex];
          
          if (!payout) {
            console.log(`❌ [Group: ${group.name}] No payout data found at index ${payoutIndex}`);
            continue;
          }
          
          console.log(`💰 [Group: ${group.name}] Initiating payout to recipient: ${payout.recipientId}`);
          
          // Get recipient details
          const recipient = await Wallet.findOne({ userId: payout.recipientId });
          if (!recipient) {
            console.log(`❌ [Group: ${group.name}] Recipient wallet not found for user: ${payout.recipientId}`);
            continue;
          }
          
          console.log(`👤 [Recipient Details] User: ${payout.recipientId}`);
          console.log(`   ↳ Wallet Balance: ₱${recipient.balance}`);
          console.log(`   ↳ Payout Amount: ₱${Number(group.contributionAmount) * (group.requiredMembers - 1)}`);
          console.log(`   ↳ Cycle: ${payoutIndex + 1}/${group.payouts.length}`);
          
          // Trigger payout
          const payoutResult = await triggerPayout(group.contractAddress);
          
          if (payoutResult.success) {
            console.log(`✅ [Group: ${group.name}] Payout successful!`);
            console.log(`   ↳ Recipient: ${payout.recipientId}`);
            console.log(`   ↳ Transaction Hash: ${payoutResult.txHash}`);
            console.log(`   ↳ Amount: ₱${Number(group.contributionAmount) * (group.requiredMembers - 1)}`);
            console.log(`   ↳ Explorer: https://amoy.polygonscan.com/tx/${payoutResult.txHash}`);
            
            // Update group state
            group.currentCycleContributions = 0;
            group.currentPayoutIndex += 1;
            
            // Update next payout date
            const nextPayout = group.payouts[group.currentPayoutIndex];
            if (nextPayout?.payoutDate) {
              group.nextPayoutDate = nextPayout.payoutDate;
              console.log(`📅 [Group: ${group.name}] Next payout scheduled for: ${nextPayout.payoutDate}`);
              if (nextPayout.recipientId) {
                console.log(`   ↳ Next Recipient: ${nextPayout.recipientId}`);
              }
            }
            
            await group.save();
            console.log(`💾 [Group: ${group.name}] Group state updated for next cycle`);

            // Notify recipient
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
            console.log(`📨 [User: ${payout.recipientId}] Sent payout notification`);
            
            // Handle organizer fee
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
                txHash: payoutResult?.txHash || null,
                metadata: {
                  groupId: group._id.toString(),
                  from: 'smart_contract',
                  note: '1% organizer share from payout'
                }
              });
              
              console.log(`💰 [Organizer] Fee of ₱${organizerFee} credited to ${group.handler}`);
            }
            
            // Check if group is completed
            if (group.currentPayoutIndex >= group.payouts.length) {
              console.log(`🏁 [Group: ${group.name}] All cycles completed. Marking group as completed...`);
              group.status = "completed";
              await group.save();
              
              // Handle member refunds and final notifications
              for (const member of group.members) {
                if (member.depositAmount > 0) {
                  const memberWallet = await Wallet.findOne({ userId: member.userId });
                  if (memberWallet) {
                    memberWallet.balance += member.depositAmount;
                    await memberWallet.save();
                    
                    await Transaction.create({
                      userId: member.userId,
                      type: "refund",
                      amount: member.depositAmount,
                      txHash: payoutResult?.txHash || null,
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
                
                // Final notification
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
              
              console.log(`🎉 [Group: ${group.name}] Group completion process finished`);
            }
          } else {
            console.log(`❌ [Group: ${group.name}] Payout failed:`);
            console.log(`   ↳ Recipient: ${payout.recipientId}`);
            console.log(`   ↳ Error: ${payoutResult.error}`);
            console.log(`   ↳ Amount: ₱${Number(group.contributionAmount) * (group.requiredMembers - 1)}`);
          }
        } else {
          await group.save();
          console.log(`⏳ [Group: ${group.name}] Waiting for more contributions...`);
        }
      }      
  
      if (group.currentCycleContributions > 0) {
        group.lastContributionDate = new Date();
        await group.save();
        console.log(`💾 [Group: ${group.name}] Updated lastContributionDate`);
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
      console.log(`   ↳ Current Contributions: ${group.currentCycleContributions}/${expectedContributions}`);
      console.log(`   ↳ Current Payout Index: ${payoutIndex + 1}/${group.payouts.length}`);
  
      if (payoutIndex >= group.payouts.length) {
        console.log(`✅ [Group: ${group.name}] All payout cycles completed.`);
        group.status = "completed";
        await group.save();
        continue;
      }

      // Check if we have enough contributions
      if (group.currentCycleContributions < expectedContributions) {
        console.log(`⏳ [Group: ${group.name}] Not enough contributions yet.`);
        continue;
      }

      const payout = group.payouts?.[payoutIndex];
      if (!payout) {
        console.log(`❌ [Group: ${group.name}] No payout data found at index ${payoutIndex}`);
        continue;
      }
  
      // Get recipient details
      const recipient = await Wallet.findOne({ userId: payout.recipientId });
      if (!recipient) {
        console.log(`❌ [Group: ${group.name}] Recipient wallet not found for user: ${payout.recipientId}`);
        continue;
      }
  
      // Get recipient user details for name
      const recipientUser = await User.findById(payout.recipientId);
      const recipientName = recipientUser?.name || 'Unknown';

      console.log(`👤 [Recipient Details]`);
      console.log(`   ↳ User ID: ${payout.recipientId}`);
      console.log(`   ↳ Name: ${recipientName}`);
      console.log(`   ↳ Current Wallet Balance: ₱${recipient.balance}`);

      try {
        // Calculate total PHP amount (contribution amount is already in PHP)
        const contributionAmountPHP = Number(group.contributionAmount);
        const totalPHP = contributionAmountPHP * expectedContributions;
        
        // Calculate fees (1% system + 1% organizer)
        const systemFee = (totalPHP * 1) / 100;
        const organizerFee = (totalPHP * 1) / 100;
        const recipientAmount = totalPHP - systemFee - organizerFee;

        console.log(`💰 [Group: ${group.name}] Total PHP amount: ₱${totalPHP}`);
        console.log(`   ↳ Contribution Amount: ₱${contributionAmountPHP}`);
        console.log(`   ↳ Number of Contributions: ${expectedContributions}`);
        console.log(`   ↳ System Fee (1%): ₱${systemFee}`);
        console.log(`   ↳ Organizer Fee (1%): ₱${organizerFee}`);
        console.log(`   ↳ Recipient Amount: ₱${recipientAmount}`);

        // Credit recipient's wallet
        const newBalance = Number(recipient.balance) + recipientAmount;
        recipient.balance = newBalance;
        await recipient.save();
        console.log(`✅ [Recipient] Wallet credited with ₱${recipientAmount}`);
        console.log(`   ↳ Previous Balance: ₱${recipient.balance - recipientAmount}`);
        console.log(`   ↳ New Balance: ₱${newBalance}`);

        // Create transaction record for recipient
        const referenceId = `PAYOUT-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        await Transaction.create({
          userId: payout.recipientId,
          type: "payout",
          amount: recipientAmount,
          referenceId,
          metadata: {
            groupId: group._id.toString(),
            groupName: group.name,
            cycle: payoutIndex + 1,
            totalCycles: group.payouts.length,
            contributionAmount: contributionAmountPHP,
            numberOfContributions: expectedContributions,
            totalAmount: totalPHP,
            systemFee,
            organizerFee
          },
          status: "confirmed"
        });
        console.log(`📝 [Transaction] Payout recorded with reference: ${referenceId}`);

        // Handle system fee
        const systemWallet = await Wallet.findOne({ userId: process.env.SYSTEM_WALLET_ID });
        if (systemWallet) {
          systemWallet.balance += systemFee;
          await systemWallet.save();
      
          await Transaction.create({
            userId: process.env.SYSTEM_WALLET_ID,
            type: 'payout_share',
            amount: systemFee,
            referenceId: `system-share-${Date.now()}`,
            status: 'confirmed',
            metadata: {
              groupId: group._id.toString(),
              from: 'payout_processing',
              note: '1% system share from payout',
              hideFromAudit: true
            }
          });
        }

        // Handle organizer fee
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
            metadata: {
              groupId: group._id.toString(),
              from: 'payout_processing',
              note: '1% organizer share from payout',
              hideFromAudit: true
            }
          });
      
          console.log(`💰 [Organizer] Fee of ₱${organizerFee} credited to ${group.handler}`);
        }

        // Update group state
        group.currentCycleContributions = 0;
        group.currentPayoutIndex += 1;

        // Update next payout date
        const nextPayout = group.payouts[group.currentPayoutIndex];
        if (nextPayout?.payoutDate) {
          group.nextPayoutDate = nextPayout.payoutDate;
          console.log(`📅 [Group: ${group.name}] Next payout scheduled for: ${nextPayout.payoutDate}`);
          if (nextPayout.recipientId) {
            const nextRecipient = await User.findById(nextPayout.recipientId);
            console.log(`   ↳ Next Recipient: ${nextPayout.recipientId} (${nextRecipient?.name || 'Unknown'})`);
          }
        }

        await group.save();
        console.log(`💾 [Group: ${group.name}] Group state updated for next cycle`);

        // Notify recipient
        await MemberNotification.create({
          userId: payout.recipientId,
          message: `🎉 You received your payout of ₱${recipientAmount} from group "${group.name}".`,
          type: "payout_received",
          groupId: group._id,
        });
      
        await sendPushToUser(
          payout.recipientId.toString(),
          "WulaPal",
          `🎉 You received your payout of ₱${recipientAmount} from "${group.name}".`
        );
        console.log(`📨 [User: ${payout.recipientId}] Sent payout notification`);

        // Check if group is completed
        if (group.currentPayoutIndex >= group.payouts.length) {
          console.log(`🏁 [Group: ${group.name}] All cycles completed. Marking group as completed...`);
          group.status = "completed";
          await group.save();
          
          // Handle member refunds and final notifications
          for (const member of group.members) {
            if (member.depositAmount > 0) {
              const memberWallet = await Wallet.findOne({ userId: member.userId });
              if (memberWallet) {
                memberWallet.balance += member.depositAmount;
                await memberWallet.save();
    
                await Transaction.create({
                  userId: member.userId,
                  type: "refund",
                  amount: member.depositAmount,
                  referenceId: `REFUND-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
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
    
            // Final notification
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
    
          console.log(`🎉 [Group: ${group.name}] Group completion process finished`);
        }

      } catch (error) {
        console.log(`❌ [Group: ${group.name}] Payout processing failed:`);
        console.log(`   ↳ Recipient: ${payout.recipientId} (${recipientName})`);
        console.log(`   ↳ Error: ${error.message}`);
        console.log(`   ↳ Amount: ₱${Number(group.contributionAmount) * expectedContributions}`);
      }
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