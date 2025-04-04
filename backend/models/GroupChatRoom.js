const mongoose = require('mongoose');

const GroupChatRoomSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('GroupChatRoom', GroupChatRoomSchema);
