const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// ✅ Get all messages for a group
router.get('/group/:groupId', chatController.getMessages);

// ✅ Send a message to a group — pass Socket.IO instance from app
router.post('/group/:groupId/send', (req, res) => {
  req.io = req.app.get('io'); // Inject socket.io
  chatController.sendMessage(req, res);
});

// ✅ Mark messages as read for a group
router.post('/group/:groupId/mark-read', chatController.markMessagesRead);

module.exports = router;
