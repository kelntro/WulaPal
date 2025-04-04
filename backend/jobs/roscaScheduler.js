const cron = require("node-cron");
const {
  handleAutoContribution,
  handleAutoPayouts,
  confirmPendingPayments
} = require("./tasks");

// 🕐 Auto-Contribution: Every 10 minutes
cron.schedule("*/3 * * * *", async () => {
  console.log("🕐 [Cron] Running Auto-Contribution Check (every 10 minutes)...");
  await handleAutoContribution();
});

// 💸 Auto-Payout: Every 10 minutes
cron.schedule("*/3 * * * *", async () => {
  console.log("💸 [Cron] Running Auto-Payout Check (every 10 minutes)...");
  await handleAutoPayouts();
});

// 🔁 Contribution Confirmation: Every 10 minutes
cron.schedule("*/3 * * * *", async () => {
  console.log("🔁 [Cron] Checking pending contribution confirmations...");
  await confirmPendingPayments();
});
