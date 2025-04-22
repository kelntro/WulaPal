const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: { type: String, required: true }, // can be "organizer" or userId
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
