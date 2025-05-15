const express = require("express");
const router = express.Router();
const Message = require("../models/Message"); // you need Message model
const User = require("../models/User"); // double check path if needed
const { sendPushToUser } = require("../services/pushService");

// @desc    Send message to user
// @route   POST /api/messages/send
// backend: messageRoutes.js
router.post("/send", async (req, res) => {
    const { toUserId, fromUserId, content } = req.body;  // 🔥 receive fromUserId!
  
    if (!toUserId || !content || !fromUserId) {
      return res.status(400).json({ message: "Missing fields" });
    }
  
    try {
      // Check if recipient exists
      const recipient = await User.findById(toUserId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }

      // Get sender details for notification
      const sender = await User.findById(fromUserId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }
  
      // Create and save message
      const newMessage = new Message({
        to: toUserId,
        from: fromUserId,  // 🔥 use the correct sender id
        content,
        timestamp: new Date(),
      });
  
      await newMessage.save();

      // Send push notification to recipient
      await sendPushToUser(
        toUserId,
        `New message from ${sender.name}`,
        content
      );
  
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
  

module.exports = router;
