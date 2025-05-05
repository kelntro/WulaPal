const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User"); // adjust path if needed
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const profileUploadPath = path.join(__dirname, '..', 'uploads', 'profile');

if (!fs.existsSync(profileUploadPath)) {
  fs.mkdirSync(profileUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads';

    if (file.fieldname === 'profileImage') {
      folder = 'uploads/profile';
    } else if (file.fieldname === 'idImageFile') {
      folder = 'uploads/id';
    }

    const fullPath = path.join(__dirname, '..', folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'idImageFile' ? 'id_' : 'profile_';
    cb(null, `${prefix}${Date.now()}${ext}`);
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
  
  router.patch(
    '/update',
    upload.fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'idImageFile', maxCount: 1 },
    ]),
    async (req, res) => {
      const { userId, ...updates } = req.body;
    
      console.log("📥 Received update request:", req.body);
    
      if (!userId) {
        console.warn("⚠️ Missing userId in request body.");
        return res.status(400).json({ error: "User ID is required" });
      }
  
      // 🖼️ Save file paths if uploaded
      if (req.files?.profileImage?.[0]) {
        updates.profileImage = `/uploads/profile/${req.files.profileImage[0].filename}`;
      }
      if (req.files?.idImageFile?.[0]) {
        updates.idImage = `/uploads/id/${req.files.idImageFile[0].filename}`;
      }
      
  
      // 🧼 Clean nested fields
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
        res.status(500).json({ error: "Failed to update profile" });
      }
    }
  );  

  router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    console.log("📥 Fetching user by ID:", userId);
  
    try {
      const user = await User.findById(userId)
        .select("name email profileImage role dateofBirth country mobile address plan createdAt userId gender occupation sourceOfFunds idType idImage emergencyContact pinCode lastActive")
        .lean();
  
      if (!user) {
        console.warn("❌ User not found:", userId);
        return res.status(404).json({ message: "User not found" });
      }
  
      console.log("✅ User fetched successfully:", user._id);
      res.json(user);
    } catch (err) {
      console.error("❌ [User Profile Error]:", err.message);
      console.error("❌ Stack Trace:", err.stack);
      res.status(500).json({ message: "Server error during user fetch", error: err.message });
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
  
  router.patch('/last-active/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const timestamp = req.body.timestamp || new Date();
  
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { lastActive: timestamp },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ message: 'Last active updated', user: updatedUser });
    } catch (error) {
      console.error('Error updating lastActive:', error.message);
      res.status(500).json({ error: 'Failed to update last active' });
    }
  });  
  
  module.exports = router;