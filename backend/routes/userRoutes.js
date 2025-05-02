const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User"); // adjust path if needed
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profile/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });
// @desc    Search users by name, email, or _id
// @route   GET /api/users/search?q=yourQuery
// @access  Public (or make it private later if needed)
router.get("/search", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query is required" });
  
    try {
      const regex = new RegExp(q, "i"); // case-insensitive
  
      const query = {
        $or: [
          { name: { $regex: regex } },
          { email: { $regex: regex } },
        ],
      };
  
      // 🛡 Only search by _id if valid ObjectId
      if (mongoose.Types.ObjectId.isValid(q)) {
        query.$or.push({ _id: q });
      }
  
      const users = await User.find(query);
  
      res.json(users); // returns an array ✅
    } catch (err) {
      console.error("❌ [Search API Error]:", err.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  router.patch('/update', upload.single('profileImage'), async (req, res) => {
    const { userId, ...updates } = req.body;
  
    console.log("📥 Received update request:", req.body);
  
    if (!userId) {
      console.warn("⚠️ Missing userId in request body.");
      return res.status(400).json({ error: "User ID is required" });
    }
  
    // 🖼️ Add image path if file uploaded
    if (req.file) {
      updates.profileImage = `/uploads/profile/${req.file.filename}`;
    }
  
    // 🧼 Clean string and nested empty values
    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'string' && updates[key].trim() === '') {
        updates[key] = null;
      }
  
      if (typeof updates[key] === 'object' && updates[key] !== null) {
        try {
          updates[key] = JSON.parse(updates[key]);
        } catch (e) {}
        Object.keys(updates[key]).forEach(subKey => {
          if (updates[key][subKey] === '') {
            updates[key][subKey] = null;
          }
        });
      }
    });
  
    try {
      const user = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      });
  
      if (!user) {
        console.warn("❌ User not found for update:", userId);
        return res.status(404).json({ error: "User not found" });
      }
  
      console.log("✅ User profile updated:", user);
      res.json(user);
    } catch (err) {
      console.error("❌ Error updating user profile:", err.message);
      console.error("❌ Stack Trace:", err.stack);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
  
    try {
      const user = await User.findById(userId)
      .select("name email profileImage role dateofBirth country mobile address plan createdAt userId gender occupation sourceOfFunds nationalIdNumber emergencyContact")
      .lean();
    
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json(user);
    } catch (err) {
      console.error("❌ [User Profile Error]:", err.message);
      res.status(500).json({ message: "Server error during user fetch" });
    }
  });
  
  
  router.patch("/update-plan", async (req, res) => {
    try {
      const { userId, plan } = req.body;
      if (!userId || !plan) return res.status(400).json({ error: "Missing fields" });
  
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
  
      const validPlans = ["Free", "Basic", "Pro"];
      const currentIndex = validPlans.indexOf(user.plan);
      const newIndex = validPlans.indexOf(plan);
  
      if (newIndex === -1 || newIndex <= currentIndex) {
        return res.status(400).json({ error: "Invalid upgrade. You can't downgrade or re-purchase the same plan." });
      }
  
      user.plan = plan;
      await user.save();
  
      res.json({ success: true, message: `Plan upgraded to ${plan}` });
    } catch (err) {
      console.error("❌ Error updating user plan:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  
  module.exports = router;