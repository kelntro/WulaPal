const GroupChatRoom = require('../models/GroupChatRoom');
const ChatMessage = require('../models/ChatMessage');
const Group = require('../models/Group');
const User = require('../models/User');

exports.getMessages = async (req, res) => {
  const { groupId } = req.params;

  try {
    const room = await GroupChatRoom.findOne({ groupId });
    if (!room) return res.json([]); // No room = no messages

    const messages = await ChatMessage.find({ roomId: room._id }).sort('timestamp');
    res.json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.sendMessage = async (req, res) => {
  const groupId = req.params.groupId; // ✅ get from params, not body
  const { sender, type, content } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const user = await User.findById(sender);
    const isOrganizer = group.handler === user.name;
    const isMember = group.members.some(m => m.userId.toString() === sender);

    if (!isOrganizer && !isMember) {
      return res.status(403).json({ error: "You must join the group to chat." });
    }

    let room = await GroupChatRoom.findOne({ groupId });
    if (!room) {
      room = await GroupChatRoom.create({
        groupId,
        members: [sender],
      });
    }

    const message = await ChatMessage.create({
      roomId: room._id,
      sender,
      type,
      content
    });

    req.app.get('io').in(groupId).emit('new-message', message);
    res.status(201).json(message);
  } catch (error) {
    console.error("❌ Error sending message:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};


exports.markMessagesRead = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    const room = await GroupChatRoom.findOne({ groupId });
    if (!room) return res.sendStatus(404);

    await ChatMessage.updateMany(
      { roomId: room._id, seenBy: { $ne: userId } },
      { $push: { seenBy: userId } }
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error marking messages read:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
