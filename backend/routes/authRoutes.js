const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Login Route (for both Organizers and Members)
router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!role || !["organizer", "member"].includes(role)) {
            return res.status(400).json({ error: "Invalid role. Must be 'organizer' or 'member'." });
        }

        // Check if user exists with the given role
        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(400).json({ error: `Invalid credentials or no ${role} account found.` });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, "secret_key", { expiresIn: "1h" });

        res.json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
            } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Register Route (for both Organizers and Members)
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!role || !["organizer", "member"].includes(role)) {
            return res.status(400).json({ error: "Invalid role. Must be 'organizer' or 'member'." });
        }

        // Check if user already exists with the same email and role
        const existingUser = await User.findOne({ email, role });
        if (existingUser) {
            return res.status(400).json({ error: `Email already registered as a ${role}.` });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.status(201).json({ success: true, message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully.` });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
