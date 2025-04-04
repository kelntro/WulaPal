const mongoose = require("mongoose");

const memberNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  type: { type: String, default: "info" }, // e.g. "low_funds_warning", "confirmation_request"
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  processed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model("MemberNotification", memberNotificationSchema);
