const cron = require("node-cron");
const {
  handleAutoContribution,
  handleAutoPayouts,
  confirmPendingPayments,
  sendUpcomingContributionReminders 
} = require("./tasks");

module.exports = (io) => {
  // Auto-Contribution
  cron.schedule("*/10 * * * *", async () => {
    console.log("🕐 [Cron] Running Auto-Contribution Check...");
    await handleAutoContribution(io);
  });

  // Auto-Payout
  cron.schedule("*/10 * * * *", async () => {
    console.log("💸 [Cron] Running Auto-Payout Check...");
    await handleAutoPayouts(io);
  });

  // Confirm Payments
  cron.schedule("*/10 * * * *", async () => {
    console.log("🔁 [Cron] Checking pending contribution confirmations...");
    await confirmPendingPayments(io);
  });

  // Daily Reminders
  cron.schedule("0 10 * * *", async () => {
    console.log("📆 [Cron] Sending contribution reminders...");
    await sendUpcomingContributionReminders(io);
  });
};