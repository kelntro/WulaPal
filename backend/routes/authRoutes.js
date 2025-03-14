const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

const router = express.Router();

// ✅ Configure Nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == "465", // Use `true` for SSL (465), `false` for TLS (587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ Function to Send Email (Verification)
const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:5050/api/auth/verify-email/${token}`;

  const mailOptions = {
    from: `"WulaPal Team" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify Your Email - WulaPal",
    html: `
      <h2>Welcome to WulaPal!</h2>
      <p>Please confirm your email by clicking the link below:</p>
      <a href="${verificationLink}" style="display:inline-block;padding:10px 20px;background:#3A6953;color:white;text-decoration:none;border-radius:5px;">Verify Email</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    console.log(`📧 Sending email to ${email}...`);
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return false;
  }
};

// ✅ Function to Send OTP Email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"WulaPal Team" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Your OTP Code - WulaPal",
    html: `
      <h2>Your OTP Code</h2>
      <p>Your OTP code is <strong>${otp}</strong>. It will expire in 60 seconds.</p>
    `,
  };

  try {
    console.log(`📧 Sending OTP to ${email}...`);
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ OTP email sending failed:", error);
    return false;
  }
};

// ✅ Register Route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!role || !["organizer", "member"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be 'organizer' or 'member'." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // ✅ Send Verification Email Before Saving User
    if (!(await sendVerificationEmail(email, verificationToken))) {
      return res
        .status(500)
        .json({ error: "Email service error. Please try again later." });
    }

    // ✅ Save User Only If Email Was Sent Successfully
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
    });

    await newUser.save();
    res.status(201).json({
      success: true,
      message: "Check your email to verify your account.",
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Verify Email Route
router.get("/verify-email/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    console.log(`✅ User ${user.email} verified successfully.`);
    res.redirect("http://localhost:5173/login?verified=true"); // Redirect to frontend login page
  } catch (error) {
    console.error("❌ Email verification error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Resend Verification Email Route
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email is already verified." });
    }

    // Generate a new verification token if missing
    if (!user.verificationToken) {
      user.verificationToken = crypto.randomBytes(32).toString("hex");
      await user.save();
    }

    if (!(await sendVerificationEmail(email, user.verificationToken))) {
      return res
        .status(500)
        .json({ error: "Email service error. Please try again later." });
    }

    res.json({
      success: true,
      message: "Verification email sent. Try again in 60 seconds.",
    });
  } catch (error) {
    console.error("❌ Resend verification error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Login Route (BLOCKS Unverified Users and Initiates OTP for Verified Users)
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!role || !["organizer", "member"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be 'organizer' or 'member'." });
    }

    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ error: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate OTP for verified user
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 60 * 1000); // OTP expires in 60 seconds
    await user.save();

    // Send OTP Email
    if (!(await sendOTPEmail(user.email, otp))) {
      return res
        .status(500)
        .json({ error: "Failed to send OTP. Please try again later." });
    }

    // Respond indicating that OTP has been sent
    res.json({
      success: true,
      otpSent: true,
      message: "OTP has been sent to your email. It expires in 60 seconds.",
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Verify OTP Route
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }
    if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ error: "OTP expired. Please request a new one." });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP." });
    }
    // OTP is valid, clear OTP fields and generate JWT token
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ success: true, token, user });
  } catch (error) {
    console.error("❌ OTP verification error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Resend OTP Route
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }
    if (!user.isVerified) {
      return res
        .status(400)
        .json({
          error: "Email is not verified. Please verify your email first.",
        });
    }
    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 60 * 1000);
    await user.save();
    if (!(await sendOTPEmail(user.email, otp))) {
      return res
        .status(500)
        .json({ error: "Failed to send OTP. Please try again later." });
    }
    res.json({ success: true, message: "OTP resent. Check your email." });
  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
