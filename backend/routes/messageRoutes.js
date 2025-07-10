const express = require("express");
const router = express.Router();
const Message = require("../models/Message"); // you need Message model
const User = require("../models/User"); // double check path if needed
const GroupChatRoom = require("../models/GroupChatRoom");
const ChatMessage = require("../models/ChatMessage");
const { sendPushToUser } = require('../services/pushService');

// @desc    Send message to user
// @route   POST /api/messages/send
// backend: messageRoutes.js
router.post("/send", async (req, res) => {
  const { toUserId, fromUserId, content, type = "text", senderName } = req.body;
  
    if (!toUserId || !content || !fromUserId) {
      return res.status(400).json({ message: "Missing fields" });
    }
  
    try {
      // Check if recipient exists
      const recipient = await User.findById(toUserId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
  
      // Create and save message
      const newMessage = new Message({
        to: toUserId,
        from: fromUserId,
        content,
        type, // ✅ Add this
        timestamp: new Date(),
      });      
  
      await newMessage.save();
  
      // Send push notification to recipient
      if (recipient.fcmToken) {
        const notificationTitle = senderName || 'New Message';
        const notificationBody = type === 'text' ? content : 'Sent you a file';
        await sendPushToUser(toUserId, notificationTitle, notificationBody);
      }
  
      res.status(201).json({ message: "Message sent successfully!" });
    } catch (err) {
      console.error("❌ [Send Message Error]:", err.message);
      res.status(500).json({ message: "Server error during message send" });
    }
  });  

// ✅ FIX conversation fetching
router.get("/conversation/:userId", async (req, res) => {
    const { userId } = req.params;
  
    try {
      const messages = await Message.find({
        $or: [
          { to: userId },
          { from: userId },
        ],
      }).sort({ timestamp: 1 }); // 🔥 sort oldest to newest
  
      res.json(messages);
    } catch (err) {
      console.error("❌ [Conversation Fetch Error]:", err.message);
      res.status(500).json({ message: "Server error during conversation fetch" });
    }
  });
  
router.get("/unread-count/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const personalUnread = await Message.countDocuments({
      to: userId,
      seenBy: { $ne: userId }
    });

    const groupRooms = await GroupChatRoom.find({ members: userId });
    const roomIds = groupRooms.map(room => room._id);

    const groupUnread = await ChatMessage.countDocuments({
      roomId: { $in: roomIds },
      seenBy: { $ne: userId }
    });

    res.json({ personalUnread, groupUnread, total: personalUnread + groupUnread });
  } catch (error) {
    console.error("❌ Error getting unread count:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Mark personal messages as read
router.post("/mark-read/:fromUserId", async (req, res) => {
  const { fromUserId } = req.params;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ message: "Missing userId" });

  try {
    await Message.updateMany(
      {
        from: fromUserId,
        to: userId,
        seenBy: { $ne: userId }
      },
      { $push: { seenBy: userId } }
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error marking personal messages read:", error.message);
    res.status(500).json({ message: "Failed to update seen status" });
  }
});


module.exports = router;
