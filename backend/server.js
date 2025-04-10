const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const {
  createGroup,
  contribute,
  getContractBalance,
} = require("./services/wulapalService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const socketIo = require("socket.io");
const os = require("os");
const User = require("./models/User");
const walletRoutes = require("./routes/walletRoutes");
const Notification = require("./models/Notification");
const MemberNotification = require("./models/MemberNotification");
const chatRoutes = require("./routes/chatRoutes");

// 🔌 Connect to MongoDB here
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
  });

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - Body:`, req.body);
  next();
});

app.use("/api/wallet", walletRoutes); // ✅ Register wallet routes
// ✅ Get Local Network IP (for mobile access)
const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const details of iface) {
      if (details.family === "IPv4" && !details.internal) {
        return details.address;
      }
    }
  }
  return "localhost"; // Fallback to localhost
};

const SERVER_IP = "192.168.56.1"; // ✅ Use only the IP, without "http://" and ":5050"
const SERVER_URL = `http://${SERVER_IP}:5050`;

const Group = require("./models/Group");

// ✅ Update `/api/create-group` to Emit Event When New Group is Created
app.post("/api/create-group", async (req, res) => {
  try {
    console.log("📥 Received request to create group:", req.body);

    const {
      name,
      contributionAmount,
      frequency,
      requiredMembers,
      image,
      description,
      slots,
      handler,
    } = req.body;

    if (
      !name ||
      !contributionAmount ||
      !frequency ||
      !requiredMembers ||
      !slots
    ) {
      console.error("❌ Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("🚀 Deploying contract to blockchain...");
    const blockchainResult = await createGroup(
      contributionAmount,
      frequency,
      requiredMembers
    );

    if (!blockchainResult.success) {
      console.error("❌ Blockchain Deployment Failed:", blockchainResult.error);
      return res.status(500).json({ error: blockchainResult.error });
    }

    console.log("📦 Saving group to MongoDB...");
    const newGroup = new Group({
      name,
      contributionAmount,
      frequency:
        frequency === 300 * 1e6
          ? "Weekly"
          : frequency === 600 * 1e6
          ? "Bi-Weekly"
          : "Monthly",
      requiredMembers,
      image: image.startsWith("http")
        ? image
        : `${SERVER_URL}/uploads/${path.basename(image)}`,
      description,
      slots,
      handler: handler || "Unknown Organizer",
      contractAddress: blockchainResult.contractAddress,
      tokenAddress: blockchainResult.tokenAddress,
      members: [],
      status: "open",
    });

    await newGroup.save();
    console.log("✅ Group saved successfully:", newGroup);

    // ✅ Save notification to DB and emit
    const organizer = await User.findOne({ name: newGroup.handler });
    if (organizer) {
      const savedNotification = await Notification.create({
        organizerId: organizer._id,
        message: `Group "${newGroup.name}" created.`,
      });

      io.emit("newGroup", {
        organizerId: organizer._id.toString(),
        message: savedNotification.message,
        date: savedNotification.date,
        _id: savedNotification._id,
        read: savedNotification.read,
      });
    }

    res.json({ success: true, group: newGroup });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/contribute", async (req, res) => {
  try {
    const { contractAddress, tokenAddress, amount } = req.body;
    const result = await contribute(req.userAddress, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/get-balance", async (req, res) => {
  try {
    const balance = await getContractBalance();
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all groups
app.get("/api/groups", async (req, res) => {
  try {
    const groups = await Group.find();

    // ✅ Ensure image URLs are complete
    const updatedGroups = groups.map((group) => ({
      ...group._doc,
      image: group.image.startsWith("http")
        ? group.image
        : `${SERVER_URL}/uploads/${path.basename(group.image)}`,
    }));

    console.log("📤 Sending groups data:", updatedGroups);
    res.json(updatedGroups);
  } catch (error) {
    console.error("❌ Error fetching groups:", error);
    res.status(500).json({ error: error.message });
  }
});

//view group
app.get("/api/groups/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    console.log(`📥 API Request for Group ID: ${groupId}`);

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      console.error("❌ Invalid Group ID format.");
      return res.status(400).json({ error: "Invalid Group ID format" });
    }

    // ✅ Find the group and populate members with user details including `userId`
    const group = await Group.findById(groupId)
      .populate({
        path: "members.userId",
        select: "userId name email", // ✅ Include `userId`
      })
      .lean();

    if (!group) {
      console.error("❌ Group not found in database.");
      return res.status(404).json({ error: "Group not found" });
    }

    // ✅ Format the members list to include userId
    const formattedMembers = group.members.map((member) => ({
      id: member.userId._id.toString(),
      userId: member.userId.userId || "N/A", // ✅ Ensure `userId` is fetched
      name: member.userId.name || "Unknown",
      email: member.userId.email || "No Email",
      dateJoined: new Date(member.joinDate).toLocaleDateString(),
      timeJoined: new Date(member.joinDate).toLocaleTimeString(),
    }));

    // ✅ Format payouts to include recipient details
    const formattedPayouts = await Promise.all(
      (group.payouts || []).map(async (payout) => {
        const recipient = await User.findById(payout.recipientId, {
          userId: 1,
          name: 1,
        }).lean();
        return {
          recipientId: payout.recipientId.toString(),
          recipientUserId: recipient ? recipient.userId : "N/A", // ✅ Ensure User ID is included
          recipientName: recipient ? recipient.name : "Unknown",
          payoutDate: new Date(payout.payoutDate).toLocaleDateString(),
        };
      })
    );

    // ✅ Attach formatted data to response
    const formattedGroup = {
      ...group,
      members: formattedMembers,
      payouts: formattedPayouts,
      nextPayoutDate: group.nextPayoutDate
        ? new Date(group.nextPayoutDate).toLocaleDateString()
        : "Not Set",
      startDate: group.startDate
        ? new Date(group.startDate).toISOString()
        : null,
    };

    console.log("✅ Group Data Sent:", formattedGroup);
    res.json(formattedGroup);
  } catch (error) {
    console.error("❌ Error fetching group details:", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// Add Member to Group by Account Number
app.post("/api/groups/:groupId/add-member", async (req, res) => {
  try {
    const { accountNumber } = req.body;
    const { groupId } = req.params;

    if (!accountNumber || !groupId) {
      return res
        .status(400)
        .json({ error: "Account Number and Group ID are required" });
    }

    // ✅ Find the user by account number
    const user = await User.findOne({ email: accountNumber });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // 🔥 Clean members array
    group.members = group.members.filter(
      (member) => member.userId !== null && member.userId !== undefined
    );

    // Check if full
    if (group.members.length >= group.requiredMembers) {
      return res.status(400).json({ error: "Group is already full" });
    }

    // Prevent duplicates
    if (
      group.members.some(
        (member) => member.userId.toString() === user._id.toString()
      )
    ) {
      return res.status(400).json({ error: "User already joined this group" });
    }

    // ✅ Add user
    group.members.push({
      userId: user._id,
      joinDate: new Date(),
    });

    // ✅ Handle full group logic
    if (group.members.length >= group.requiredMembers) {
      group.status = "active";
      group.startDate = new Date();
      group.lastContributionDate = new Date(Date.now() - 5 * 60 * 1000);
      group.hasStarted = false;

      // ✅ Trigger contribution check after 5 minutes
      setTimeout(async () => {
        const Group = require("./models/Group");
        const { handleAutoContribution } = require("./jobs/tasks");

        const freshGroup = await Group.findById(group._id);
        if (freshGroup && !freshGroup.hasStarted) {
          console.log(`⏰ [${freshGroup.name}] 5 minutes passed. Triggering first contribution check...`);
          await handleAutoContribution();
        }
      }, 5 * 60 * 1000);

      let frequencyDays;
      switch (group.frequency) {
        case "Bi-Weekly":
          frequencyDays = 14;
          break;
        case "Weekly":
          frequencyDays = 7;
          break;
        case "Monthly":
          frequencyDays = 30;
          break;
        default:
          frequencyDays = 7;
      }

      const now = new Date();
      const shuffled = [...group.members].sort(() => Math.random() - 0.5);

      group.payouts = shuffled.map((member, index) => ({
        recipientId: member.userId,
        payoutDate: new Date(now.getTime() + index * frequencyDays * 24 * 60 * 60 * 1000),
      }));

      group.nextPayoutDate = group.payouts[0].payoutDate;

      // ✅ Notify each member about their personal payout schedule
      for (const payout of group.payouts) {
        const user = await User.findById(payout.recipientId);
        const formattedDate = new Date(payout.payoutDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const message = `🗓️ Your payout for group "${group.name}" is scheduled on ${formattedDate}.`;

        await MemberNotification.create({
          userId: user._id,
          message,
          type: "payout_schedule",
          groupId: group._id,
        });

        io.emit("memberNotification", {
          userId: user._id.toString(),
          message,
          date: new Date(),
        });
      }

      // ✅ Notify all members that group started
      for (const member of group.members) {
        await MemberNotification.create({
          userId: member.userId,
          message: `🎉 Group "${group.name}" is now complete. The payout cycle is starting!`,
          type: "group_started",
          groupId: group._id,
        });

        io.emit("memberNotification", {
          userId: member.userId.toString(),
          message: `🎉 Group "${group.name}" is now complete. The payout cycle is starting!`,
          date: new Date(),
        });
      }
    }


    await group.save();

    // ✅ Save notification to DB
    const organizer = await User.findOne({ name: group.handler });
    if (organizer) {
      await Notification.create({
        organizerId: organizer._id,
        message: `New member "${user.name}" joined group "${group.name}".`,
      });

      io.emit("groupUpdated", {
        organizerId: organizer._id.toString(),
        message: `New member "${user.name}" joined group "${group.name}".`,
        date: new Date(),
      });
    }

    // ✅ Send updated members back
    const membersDetails = await Promise.all(
      group.members.map(async (member) => {
        const userDetails = await User.findById(member.userId, {
          _id: 1,
          name: 1,
        });
        return {
          id: userDetails._id.toString(),
          name: userDetails.name || "Unknown",
          dateJoined: new Date(member.joinDate).toLocaleDateString(),
          timeJoined: new Date(member.joinDate).toLocaleTimeString(),
        };
      })
    );

    res.json({
      success: true,
      members: membersDetails,
      payouts: group.payouts,
    });
  } catch (error) {
    console.error("❌ Error adding member:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ API to Find User by Account Number
app.get("/api/users/find", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    let users;

    // ✅ Search by User ID (8-character account number)
    if (query.length === 8) {
      console.log(`🔍 Searching for user by User ID: ${query}`);
      users = await User.find(
        { userId: query },
        { _id: 1, name: 1, email: 1, userId: 1 }
      );
    }
    // ✅ Search by Email
    else if (query.includes("@")) {
      console.log(`🔍 Searching for user by Email: ${query}`);
      users = await User.find(
        { email: query },
        { _id: 1, name: 1, email: 1, userId: 1 }
      );
    }
    // ✅ Search by Name (partial match, case insensitive)
    else {
      console.log(`🔍 Searching for users by Name: ${query}`);
      users = await User.find(
        { name: { $regex: query, $options: "i" } },
        { _id: 1, name: 1, email: 1, userId: 1 }
      );
    }

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No users found." });
    }

    console.log("✅ Users found:", users);
    res.json(users);
  } catch (error) {
    console.error("❌ Error finding users:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

//join groups
app.post("/api/join-group", async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    if (!userId || !groupId) {
      return res.status(400).json({ error: "User ID and Group ID are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // 🔥 Ensure members array does not contain null values
    group.members = group.members.filter(member => member !== null && member !== undefined);

    // Stop accepting if full
    if (group.members.length >= group.requiredMembers) {
      return res.status(400).json({ error: "Group is already full" });
    }

    // Prevent duplicate joining
    if (group.members.some(member => member.userId.toString() === userId.toString())) {
      return res.status(400).json({ error: "User already joined" });
    }

    // ✅ Add new member
    group.members.push({
      userId: new mongoose.Types.ObjectId(userId),
      joinDate: new Date()
    });

    // If full, activate group
    if (group.members.length >= group.requiredMembers) {
      group.status = "active";
      group.startDate = new Date();
      group.lastContributionDate = new Date(Date.now() - 5 * 60 * 1000);
      group.hasStarted = false;

      // ✅ Trigger contribution check after 5 minutes
      setTimeout(async () => {
        const Group = require("./models/Group");
        const { handleAutoContribution } = require("./jobs/tasks");

        const freshGroup = await Group.findById(group._id);
        if (freshGroup && !freshGroup.hasStarted) {
          console.log(`⏰ [${freshGroup.name}] 5 minutes passed. Triggering first contribution check...`);
          await handleAutoContribution();
        }
      }, 5 * 60 * 1000);

      // ✅ Setup payouts
      let frequencyDays;
      switch (group.frequency) {
        case "Bi-Weekly":
          frequencyDays = 14;
          break;
        case "Weekly":
          frequencyDays = 7;
          break;
        case "Monthly":
          frequencyDays = 30;
          break;
        default:
          frequencyDays = 7;
      }

      const now = new Date();
      const shuffled = [...group.members].sort(() => Math.random() - 0.5);

      group.payouts = shuffled.map((member, index) => ({
        recipientId: member.userId,
        payoutDate: new Date(now.getTime() + index * frequencyDays * 24 * 60 * 60 * 1000),
      }));

      group.nextPayoutDate = group.payouts[0].payoutDate;

      // ✅ Notify members of their payout schedule
      for (const payout of group.payouts) {
        const user = await User.findById(payout.recipientId);
        const formattedDate = new Date(payout.payoutDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        const message = `🗓️ Your payout for group "${group.name}" is scheduled on ${formattedDate}.`;

        await MemberNotification.create({
          userId: user._id,
          message,
          type: "payout_schedule",
          groupId: group._id
        });

        io.emit("memberNotification", {
          userId: user._id.toString(),
          message,
          date: new Date()
        });
      }

      // ✅ Notify all members group started
      for (const member of group.members) {
        await MemberNotification.create({
          userId: member.userId,
          message: `🎉 Group "${group.name}" is now complete. The payout cycle is starting!`,
          type: "group_started",
          groupId: group._id
        });

        io.emit("memberNotification", {
          userId: member.userId.toString(),
          message: `🎉 Group "${group.name}" is now complete. The payout cycle is starting!`,
          date: new Date()
        });
      }
    }

    await group.save();

    // ✅ Notify organizer
    const organizer = await User.findOne({ name: group.handler });
    if (organizer) {
      const newNotif = await Notification.create({
        organizerId: organizer._id,
        message: `New member joined group "${group.name}".`
      });

      io.emit("groupUpdated", {
        organizerId: organizer._id.toString(),
        message: newNotif.message,
        date: newNotif.date,
        _id: newNotif._id,
        read: newNotif.read
      });
    }

    res.json({ success: true, group });

  } catch (error) {
    console.error("❌ Error joining group:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Confirm a member's contribution
app.post("/api/confirm-contribution", async (req, res) => {
    try {
      const { userId, groupId } = req.body;
  
      if (!userId || !groupId) {
        return res.status(400).json({ error: "Missing userId or groupId" });
      }
  
      const Group = require("./models/Group");
      const Wallet = require("./models/Wallet");
      const MemberNotification = require("./models/MemberNotification");
      const Transaction = require("./models/Transaction");
      const { getUSDTFromPHP } = require("./utils/exchange");
      const { contribute } = require("./services/wulapalService");
  
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ error: "Group not found" });
  
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) return res.status(404).json({ error: "Wallet not found" });
  
      const amountPHP = Number(group.contributionAmount);
  
      if (wallet.balance < amountPHP) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
  
      // Convert PHP to USDT
      const { usdtAmount, rate } = await getUSDTFromPHP(amountPHP);
  
      // Send to blockchain
      await contribute(group.contractAddress, group.tokenAddress, usdtAmount);
  
      // Deduct funds
      wallet.balance -= amountPHP;
      await wallet.save();
  
      // Update group progress
      group.currentCycleContributions += 1;
      await group.save();
  
      // Mark as processed
      await MemberNotification.create({
        userId,
        groupId,
        type: "contribution_confirmed",
        message: `✅ You contributed ₱${amountPHP} to "${group.name}".`,
        processed: true,
      });
  
      const io = req.app.get("io");
      io.emit("memberNotification", {
        userId: userId.toString(),
        message: `✅ You contributed ₱${amountPHP} to "${group.name}".`,
        date: new Date()
      });

      // Log transaction
      const referenceId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      await Transaction.create({
        userId,
        type: "transfer",
        amount: amountPHP,
        amountUSDT: usdtAmount,
        exchangeRate: rate,
        referenceId,
        metadata: {
          to: `Group: ${group.name}`,
          groupId: group._id.toString(),
        },
        status: "confirmed",
      });
  
      // 🔁 Check if everyone else contributed
      const expected = group.requiredMembers - 1;
      if (group.currentCycleContributions >= expected) {
        console.log(`🎯 All contributions in for "${group.name}". Triggering payout...`);
  
        const payout = group.payouts[group.currentPayoutIndex || 0];
        if (payout) {
          const recipient = await Wallet.findOne({ userId: payout.recipientId });
          if (recipient) {
            const totalPayout = amountPHP * expected;
            recipient.balance += totalPayout;
            await recipient.save();
  
            // Log payout
            const payoutId = `PAYOUT-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
            await Transaction.create({
              userId: payout.recipientId,
              type: "receive",
              amount: totalPayout,
              referenceId: payoutId,
              metadata: {
                from: `Group: ${group.name}`,
                groupId: group._id.toString(),
                cycle: (group.currentPayoutIndex || 0) + 1,
              },
              status: "confirmed",
            });
  
            // Notify recipient
            await MemberNotification.create({
              userId: payout.recipientId,
              message: `🎉 You received ₱${totalPayout} payout from group "${group.name}".`,
              type: "payout_received",
              groupId,
            });

            // 💬 Emit real-time notification
            const io = req.app.get("io");
            io.emit("memberNotification", {
            userId: payout.recipientId.toString(),
            message: `🎉 You received ₱${totalPayout} payout from group "${group.name}".`,
            date: new Date()
            });
  
            // Reset group cycle
            group.currentCycleContributions = 0;
            group.currentPayoutIndex += 1;
  
            if (group.currentPayoutIndex >= group.payouts.length) {
              group.status = "completed";
  
              for (const member of group.members) {
                await MemberNotification.create({
                  userId: member.userId,
                  groupId: group._id,
                  message: `✅ Group "${group.name}" has completed all payout cycles.`,
                  type: "group_completed",
                });

                // 💬 Send real-time notification
                const io = req.app.get("io");
                io.emit("memberNotification", {
                userId: member.userId.toString(),
                message: `✅ Group "${group.name}" has completed all payout cycles.`,
                date: new Date()
                });

              }
  
              console.log(`🏁 Group "${group.name}" is now completed.`);
            }
  
            group.lastContributionDate = new Date();
            await group.save();
          }
        }
      }
  
      res.json({ success: true, message: "Contribution processed instantly." });
    } catch (err) {
      console.error("❌ Instant contribution failed:", err.message);
      res.status(500).json({ error: "Failed to confirm contribution." });
    }
  });

app.get("/api/organizer-groups", async (req, res) => {
  try {
    const { organizerId } = req.query;

    if (!organizerId) {
      return res.status(400).json({ error: "Organizer ID is required" });
    }

    // Check if `organizerId` is a valid MongoDB ObjectId or a name
    let query;
    if (mongoose.Types.ObjectId.isValid(organizerId)) {
      query = { _id: organizerId, role: "organizer" };
    } else {
      query = { name: organizerId, role: "organizer" };
    }

    // Find the organizer
    const organizer = await User.findOne(query);
    if (!organizer) {
      return res.status(404).json({ error: "Organizer not found" });
    }

    // Find groups where handler matches the organizer's name
    const groups = await Group.find({ handler: organizer.name });

    if (groups.length === 0) {
      return res
        .status(404)
        .json({ error: "No groups found for this organizer" });
    }

    // Format the response properly
    const formattedGroups = groups.map((group) => ({
      _id: group._id,
      name: group.name,
      contributionAmount: group.contributionAmount,
      frequency: group.frequency,
      requiredMembers: group.requiredMembers,
      image: group.image,
      description: group.description,
      slots: group.slots,
      members: group.members || [],
      status: group.status || "open",
      handler: group.handler,
      contractAddress: group.contractAddress,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    }));

    console.log(
      `✅ Fetched ${formattedGroups.length} groups for organizer: ${organizer.name}`
    );
    res.json(formattedGroups);
  } catch (error) {
    console.error("❌ Server Error:", error.message, error.stack);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ Ensure `uploads/` directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Setup Multer Storage
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// ✅ Image Upload API - Ensure This Exists
app.post("/api/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    console.error("❌ No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }
  const imageUrl = `${SERVER_URL}/uploads/${req.file.filename}`;

  console.log("✅ Image uploaded successfully:", imageUrl);
  res.json({ url: imageUrl });
});

const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
  },
});

// ✅ WebSocket connection event with logging
io.on("connection", (socket) => {
  console.log(`🔗 New WebSocket client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });

  // ✅ Emit when a group is updated
  socket.on("updateGroup", (group) => {
    console.log(`🔄 Group updated: ${group.name}`);
    io.emit("groupUpdated", group); // Broadcast update to all clients
  });

  // ✅ Send confirmation to the client
  socket.emit("serverConnected", {
    message: "WebSocket Connected Successfully",
  });
});

// ✅ Serve Uploaded Images Publicly
app.use("/uploads", express.static(uploadDir));

const PORT = process.env.PORT || 5050;
server.listen(PORT, () =>
  console.log(`✅ WebSocket & Backend running on port ${PORT}`)
);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

app.get("/api/member-notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { filter, from, to } = req.query;
  
      const query = { userId };
  
      if (filter === "today") {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
  
        const end = new Date();
        end.setHours(23, 59, 59, 999);
  
        query.date = { $gte: start, $lte: end };
      } else if (filter === "yesterday") {
        const start = new Date();
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
  
        const end = new Date();
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
  
        query.date = { $gte: start, $lte: end };
      } else if (from && to) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
  
        if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
          query.date = {
            $gte: fromDate,
            $lte: toDate
          };
        } else {
          return res.status(400).json({ error: "Invalid date range" });
        }
      }
  
      const notifications = await MemberNotification.find(query).sort({ date: -1 });
      res.json(notifications);
    } catch (error) {
      console.error("❌ Error fetching filtered notifications:", error.message);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });
  
  
  //read
app.patch("/api/member-notifications/:id/read", async (req, res) => {
  await MemberNotification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});

app.post("/api/confirm-contribution", async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    if (!userId || !groupId) {
      return res.status(400).json({ error: "Missing userId or groupId" });
    }

    await MemberNotification.create({
      userId,
      groupId,
      type: "contribution_confirmed",
      message: `✅ You confirmed your contribution for group.`,
      processed: false,
    });

    // 💬 Emit instantly to frontend/mobile
    const io = req.app.get("io");
    io.emit("memberNotification", {
      userId: userId.toString(),
      message: `✅ You confirmed your contribution for group.`,
      date: new Date()
    });

    console.log(`📥 [Confirm] User ${userId} confirmed contribution for group ${groupId}`);
    res.json({ success: true });

  } catch (err) {
    console.error("❌ Error confirming contribution:", err.message);
    res.status(500).json({ error: "Failed to confirm contribution." });
  }
});


app.set("io", io); // ✅ Make io accessible in controllers
app.use("/api/chat", chatRoutes); // ✅ Mount chat API routes

// ✅ WebSocket
io.on("connection", (socket) => {
  console.log(`🔗 WebSocket connected: ${socket.id}`);

  socket.on("join", (groupId) => {
    console.log(`👥 Socket ${socket.id} joined group ${groupId}`);
    socket.join(groupId); // ✅ this is crucial
  });
});

// ✅ Express Route
app.post('/api/users/save-fcm-token', async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
      return res.status(400).json({ error: 'Missing userId or fcmToken' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.fcmToken = fcmToken;
    await user.save();

    res.json({ success: true, message: 'FCM token saved' });
  } catch (err) {
    console.error("❌ Error saving FCM token:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

  
require("./jobs/roscaScheduler");

// ✅ Organizer Profile Routes
const profileRoutes = require("./routes/profileRoutes");
app.use("/api/profile", profileRoutes);
app.use(
  "/uploads/profile",
  express.static(path.join(__dirname, "uploads/profile"))
);
