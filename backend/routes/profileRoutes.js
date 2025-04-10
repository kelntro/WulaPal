const express = require("express");
const verifyToken = require("../middleware/auth");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ✅ Create /uploads/profile if not exists
const uploadDir = path.join(__dirname, "..", "uploads", "profile");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });

// 🔍 GET current user profile
router.get("/", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-password -otp -otpExpires -verificationToken"
  );
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// ✏️ UPDATE user profile
router.put("/", verifyToken, async (req, res) => {
  const updates = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
  }).select("-password -otp -otpExpires -verificationToken");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ success: true, user });
});

// 📷 Upload and update profile image
router.post(
  "/upload-image",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = `/uploads/profile/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imagePath },
      { new: true }
    ).select("-password -otp -otpExpires -verificationToken");

    res.json({ success: true, image: imagePath, user });
  }
);

module.exports = router;
