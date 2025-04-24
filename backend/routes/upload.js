const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// 📁 Define upload directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/chat'); // ✅ Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

// 📦 POST /api/upload-chat-file
router.post('/upload-chat-file', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const fileUrl = `http://localhost:5050/uploads/chat/${req.file.filename}`;
  res.json({ url: fileUrl });
});

module.exports = router;
