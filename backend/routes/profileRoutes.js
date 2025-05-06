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

// ✅ Storage config for ID images
const idStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const idUploadPath = path.join(__dirname, "..", "uploads", "id");
    if (!fs.existsSync(idUploadPath)) {
      fs.mkdirSync(idUploadPath, { recursive: true });
    }
    cb(null, idUploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `id_${Date.now()}${ext}`);
  },
});

const uploadId = multer({ storage: idStorage });

// 🔍 GET current user profile
router.get("/", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-password -otp -otpExpires -verificationToken"
  );
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// ✏️ UPDATE user profile
router.put(
  "/",
  verifyToken,
  uploadId.single("idImageFile"), // expecting 'idImageFile' from frontend
  async (req, res) => {
    try {
      console.log("📥 Incoming PUT /api/profile request");
      console.log("🧾 Headers:", req.headers);
      console.log("🧍 User ID from token:", req.user?.id);
      console.log("📄 Body:", req.body);
      console.log("📎 File:", req.file);

      const updates = { ...req.body };

      // ✅ Parse nested JSON fields
      ["address", "emergencyContact"].forEach((field) => {
        if (updates[field] && typeof updates[field] === "string") {
          try {
            updates[field] = JSON.parse(updates[field]);
            console.log(`✅ Parsed ${field}:`, updates[field]);
          } catch (err) {
            console.warn(`⚠️ Failed to parse ${field}:`, err.message);
            updates[field] = {};
          }
        }
      });

      // ✅ Handle uploaded ID image
      if (req.file) {
        updates.idImage = `/uploads/id/${req.file.filename}`;
        console.log("✅ Saved ID image to:", updates.idImage);
      } else {
        console.warn("⚠️ No ID image uploaded in this request.");
      }

      const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
      }).select("-password -otp -otpExpires -verificationToken");

      if (!user) {
        console.error("❌ User not found with ID:", req.user.id);
        return res.status(404).json({ error: "User not found" });
      }

      console.log("✅ Profile updated:", user._id);
      res.json({ success: true, user });
    } catch (err) {
      console.error("❌ Error updating profile:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
);



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
