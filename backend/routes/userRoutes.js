const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User"); // adjust path if needed

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
  
  router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
  
    try {
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (err) {
      console.error("❌ [User Profile Error]:", err.message);
      res.status(500).json({ message: "Server error during user fetch" });
    }
  });
  
  module.exports = router;