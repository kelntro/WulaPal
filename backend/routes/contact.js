const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER, // from .env
      pass: process.env.SMTP_PASS, // app password
    },
  });

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.EMAIL_FROM, // admin inbox
    subject: `WulaPal Contact Form - Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  };
  

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).json({ error: error.message || "Failed to send email." });
  }
});

module.exports = router;