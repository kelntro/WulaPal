require("dotenv").config({ path: __dirname + "/../.env" });  // Ensure dotenv loads correctly
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ✅ Debugging: Print MONGO_URI to verify if it's loaded
console.log("MONGO_URI:", process.env.MONGO_URI);

if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not defined. Please check your .env file.");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

(async () => {
    const hashedPassword = await bcrypt.hash("password123", 10); // Hash password
    const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword
    });

    await user.save();
    console.log("✅ Sample User Created:", user);
    mongoose.connection.close();
})();
