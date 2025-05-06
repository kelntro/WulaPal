const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupChatRoom' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  type: { type: String, enum: ['text', 'file'], default: 'text' },
  content: String, // message text or file URL
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
