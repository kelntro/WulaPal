const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Wallet = require("../models/Wallet");

require("dotenv").config();

const router = express.Router();

const generateUserId = async () => {
    let userId;
    let exists = true;
    
    // Ensure userId is unique
    while (exists) {
        userId = Math.random().toString(36).substr(2, 8).toUpperCase(); // Example: "A1B2C3D4"
        exists = await User.exists({ userId });
    }

    return userId;
};

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

// ✅ Register Route (With OTP for Members, Email Verification for Organizers)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, otp, platform } = req.body; // ✅ Add `platform` to detect web vs. mobile

    if (!role || !["organizer", "member"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'organizer' or 'member'." });
    }

    const existingUser = await User.findOne({ email, role });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: "This email is already registered as a " + role + "." });
    }    

    // ✅ Organizers Use Email Verification Instead (No OTP required)
    if (role === "organizer" || platform === "web") {
      const verificationToken = crypto.randomBytes(32).toString("hex");

      if (!(await sendVerificationEmail(email, verificationToken))) {
        return res.status(500).json({ error: "Email service error. Please try again later." });
      }

      // ✅ Save Organizer with Verification Token
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await generateUserId();

      const newUser = new User({
        userId,
        name,
        email,
        password: hashedPassword,
        role: "organizer",
        isVerified: false,
        verificationToken,
      });

      await newUser.save();

      // ✅ Create Wallet only if it doesn't exist
      const existingWallet = await Wallet.findOne({ userId: newUser._id });
      if (!existingWallet) {
        await Wallet.create({
          userId: newUser._id,
          balance: 0
        });
        console.log(`✅ Wallet created for organizer ${newUser.email} (${newUser._id})`);
      } else {
        console.log(`ℹ️ Wallet already exists for organizer ${newUser.email} (${newUser._id})`);
      }
      

      return res.status(201).json({
        success: true,
        message: "Check your email to verify your account.",
      });
    }

    // ✅ Members Must Verify OTP Before Registration
    if (role === "member" || platform === "mobile") {
      if (!otp) {
        return res.status(400).json({ error: "OTP is required for member registration." });
      }

      const userOTP = await User.findOne({ email });
      if (!userOTP || userOTP.otp !== otp || new Date() > userOTP.otpExpires) {
        return res.status(400).json({ error: "Invalid or expired OTP." });
      }

      // Clear OTP after successful verification
      userOTP.otp = null;
      userOTP.otpExpires = null;

      // Hash password and generate userId
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await generateUserId();

      userOTP.userId = userId;
      userOTP.name = name;
      userOTP.password = hashedPassword;
      userOTP.role = "member"; // Ensure role is stored
      userOTP.isVerified = true;

      await userOTP.save();
      
      // ✅ Create Wallet
      await Wallet.create({
        userId: userOTP._id,
        balance: 0
      });
      return res.status(201).json({ success: true, message: "Member registered successfully!" });
    }

    return res.status(400).json({ error: "Invalid registration request." });
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({ error: "Server error." });
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
// ✅ Login Route (No OTP for Members, Email Verification for Organizers)
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!role || !["organizer", "member"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'organizer' or 'member'." });
    }

    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    if (!user.isVerified) {
      return res.status(400).json({ error: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // ✅ No OTP Required for Members
    if (role === "member") {
      // Generate JWT Token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({ success: true, token, user });
    }

    // ✅ Organizers Continue Using Email Verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 60 * 1000); // OTP expires in 60 seconds
    await user.save();

    // Send OTP Email
    if (!(await sendOTPEmail(user.email, otp))) {
      return res.status(500).json({
        error: "Failed to send OTP. Please try again later.",
        user: { _id: user._id, role: user.role, email: user.email },
      });
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

router.post("/request-otp", async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required." });
    }

    if (!["organizer", "member"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'organizer' or 'member'." });
    }

    const existingUser = await User.findOne({ email, role });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: "This email is already registered as a " + role + "." });
    }    

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    // Store OTP and role in DB
    await User.updateOne(
      { email },
      { otp, otpExpires, role }, // Store role in temporary data
      { upsert: true }
    );

    // Send OTP Email
    if (!(await sendOTPEmail(email, otp))) {
      return res.status(500).json({ error: "Failed to send OTP." });
    }

    return res.json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    console.error("❌ Error in request-otp:", error);
    return res.status(500).json({ error: "Server error." });
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

router.post("/change-password", async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  const user = await User.findById(userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  res.json({ success: true });
});

// ✅ Google Sign-In for Organizer (Web Only)
router.post("/google-login", async (req, res) => {
  try {
    const { name, email, profileImage } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    let user = await User.findOne({ email, role: "organizer" });

    if (!user) {
      const emailUsed = await User.findOne({ email });
      if (emailUsed && emailUsed.role !== "organizer") {
        console.log("⚠️ Same email exists for different role, continuing to create new organizer...");
      }
    
      const userId = await generateUserId();
      user = await User.create({
        userId,
        name,
        email,
        profileImage,
        password: "google_oauth",
        role: "organizer",
        isVerified: true,
      });
    
      await Wallet.create({ userId: user._id, balance: 0 });
      console.log(`✅ Organizer wallet created via Google Sign-In`);
    }
    
    // Create new user if not exists
    if (!user) {
      const userId = await generateUserId();
      user = await User.create({
        userId,
        name,
        email,
        profileImage,
        password: "google_oauth", // Placeholder
        role: "organizer",
        isVerified: true,
      });

      // Create wallet
      await Wallet.create({ userId: user._id, balance: 0 });
      console.log(`✅ Organizer wallet created via Google Sign-In`);
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (error) {
    console.error("❌ Google Login error:", error.message);
    res.status(500).json({ error: "Login failed. Try again later." });
  }
});

// ✅ Google Sign-In for Member (Mobile Only)
router.post("/google-login-member", async (req, res) => {
  try {
    console.log("📥 Google Sign-In Request Body:", req.body);

    const { name, email, profileImage } = req.body;

    if (!email) {
      console.warn("⚠️ Email is missing in request.");
      return res.status(400).json({ error: "Email is required" });
    }

    let member = await User.findOne({ email, role: "member" });
    console.log("🔍 Found member user:", member ? member._id : "None");

    if (member) {
      console.log("✅ Member already exists, logging in...");

      const token = jwt.sign(
        { id: member._id, role: member.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({ token, user: member });
    }

    // 🔍 Check if same email exists for other role (organizer)
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.role !== "member") {
      console.log("⚠️ Same email used by different role (organizer), creating separate member account...");
    }

    console.log("🆕 Creating new member account...");
    const userId = await generateUserId();
    const newUser = await User.create({
      userId,
      name,
      email,
      profileImage,
      password: "google_oauth", // placeholder
      role: "member",
      isVerified: true,
    });

    await Wallet.create({ userId: newUser._id, balance: 0 });
    console.log(`✅ Wallet created for ${newUser.email}`);

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ JWT Token generated for new user");

    res.json({ token, user: newUser });

  } catch (error) {
    console.error("❌ Google Login Member Error:", error);
    res.status(500).json({ error: "Login failed. Try again later." });
  }
});

router.post("/users/check-email-role", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const organizer = await User.findOne({ email, role: "organizer" });
    if (organizer) {
      return res.json({ role: "organizer" });
    }

    const member = await User.findOne({ email, role: "member" });
    if (member) {
      return res.json({ role: "member" });
    }

    return res.json({ role: "none" }); // Email not used yet
  } catch (error) {
    console.error("❌ Error checking email role:", error);
    res.status(500).json({ error: "Server error checking email." });
  }
});


module.exports = router;
