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
const Transaction = require("./models/Transaction");
const purchaseRoutes = require('./routes/purchaseRoutes');
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const uploadRoutes = require('./routes/upload');
const verifyToken = require("./middleware/auth");
const Wallet = require("./models/Wallet");
const { getUSDTFromPHP } = require("./utils/exchange");

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

const SERVER_IP = getLocalIp();
const SERVER_URL = `http://${SERVER_IP}:5050`;
console.log(`🌐 Server IP: ${getLocalIp()}`);
console.log(`✅ Server running at http://${getLocalIp()}:5050`);

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

    const organizerUser = await User.findOne({ name: handler, role: "organizer" });
    if (!organizerUser) {
      return res.status(404).json({ error: "Organizer not found" });
    }
    
    // ✅ ENFORCE GROUP CREATION LIMIT BASED ON PLAN
    const activeGroups = await Group.find({
      handler: organizerUser._id,
      status: { $in: ["open", "active"] }
    });

    if (organizerUser.plan === "Free" && activeGroups.length >= 1) {
      return res.status(403).json({
        error: "Free plan limit reached. Complete your existing group or upgrade."
      });
    }

    if (organizerUser.plan === "Basic" && activeGroups.length >= 5) {
      return res.status(403).json({
        error: "Basic plan limit reached. Please upgrade to Pro or manage your existing groups."
      });
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
      handler: organizerUser._id,
      contractAddress: blockchainResult.contractAddress,
      tokenAddress: blockchainResult.tokenAddress,
      members: [],
      status: "open",
    });

    await newGroup.save();
    console.log("✅ Group saved successfully:", newGroup);

    // ✅ Save notification to DB and emit
    const organizer = await User.findById(newGroup.handler);
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
    const groups = await Group.find().populate('handler', 'name');

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
      return res.status(400).json({ error: "Account Number and Group ID are required" });
    }

    const user = await User.findOne({ email: accountNumber });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if already invited and pending
    const existingInvite = await MemberNotification.findOne({
      userId: user._id,
      groupId,
      type: "member_invite",
      processed: false
    });

    if (existingInvite) {
      return res.status(400).json({ error: "User already invited and waiting for confirmation." });
    }

    // Check if already in the group
    const isMember = group.members.some((m) => m.userId.toString() === user._id.toString());
    if (isMember) {
      return res.status(400).json({ error: "User already joined this group" });
    }

    // Check if full
    if (group.members.length >= group.requiredMembers) {
      return res.status(400).json({ error: "Group is already full" });
    }

    // ✅ Create invitation notification
    const message = `📢 You've been invited to join the group "${group.name}". Tap to confirm.`;
    await MemberNotification.create({
      userId: user._id,
      groupId,
      type: "member_invite",
      message,
      processed: false,
    });

    // ✅ Emit real-time notification
    const io = req.app.get("io");
    io.emit("memberNotification", {
      userId: user._id.toString(),
      message,
      date: new Date()
    });

    // ✅ Notify organizer that invite has been sent
    const organizer = await User.findById(group.handler);
    if (organizer) {
      const notifMessage = `⏳ Invite sent to "${user.name}" to join group "${group.name}". Waiting for confirmation.`;
      await Notification.create({
        organizerId: organizer._id,
        message: notifMessage,
      });

      io.emit("groupUpdated", {
        organizerId: organizer._id.toString(),
        message: notifMessage,
        date: new Date(),
      });
    }

    res.json({
      success: true,
      message: `Invite sent to "${user.name}". Awaiting confirmation.`,
    });

  } catch (error) {
    console.error("❌ Error sending invite:", error.message);
    res.status(500).json({ error: "Server error while sending invite" });
  }
});

app.post("/api/groups/:groupId/confirm-member", async (req, res) => {
  try {
    const { userId, depositAmount } = req.body;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // prevent double joins
    if (group.members.some((m) => m.userId.toString() === userId)) {
      return res.status(400).json({ error: "Already joined" });
    }

    if (group.members.length >= group.requiredMembers) {
      return res.status(400).json({ error: "Group is already full" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    const minRequired = Number(group.contributionAmount);
    const parsedDeposit = Number(depositAmount);

    if (isNaN(parsedDeposit) || parsedDeposit <= 0) {
      return res.status(400).json({ error: "Deposit must be a valid amount" });
    }

    if (parsedDeposit < minRequired) {
      return res.status(400).json({
        error: `Minimum deposit is ₱${minRequired}. You entered ₱${parsedDeposit}`,
      });
    }

    if (wallet.balance < parsedDeposit) {
      return res.status(400).json({
        error: `Insufficient balance. You need at least ₱${parsedDeposit} to confirm.`,
      });
    }

    wallet.balance -= parsedDeposit;
    await wallet.save();

    const referenceId = `SECURITY-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

await Transaction.create({
  userId,
  type: "deposit",
  amount: parsedDeposit,
  referenceId, // ✅ Fix: add this field
  metadata: {
    groupId: group._id.toString(),
    type: "security_deposit"
  },
  status: "confirmed",
});


    group.members.push({
      userId: new mongoose.Types.ObjectId(userId),
      joinDate: new Date(),
      depositAmount: parsedDeposit
    });

    await group.save();

    // ✅ Mark the invite notification as processed
    await MemberNotification.updateMany(
      { userId, groupId, type: "member_invite", processed: false },
      { processed: true }
    );

    // ✅ Confirm message
    await MemberNotification.create({
      userId,
      groupId,
      type: "member_confirmed",
      message: `✅ You joined the group "${group.name}" with a ₱${parsedDeposit} deposit.`,
      processed: true
    });

    const io = req.app.get("io");
    io.emit("memberNotification", {
      userId,
      message: `✅ You joined the group "${group.name}" with a ₱${parsedDeposit} deposit.`,
      date: new Date()
    });

    const groupHandler = await User.findById(group.handler);
    if (groupHandler) {
      const organizerMessage = `✅ "${userId}" confirmed and joined the group "${group.name}".`;

      const organizerNotif = await Notification.create({
        organizerId: groupHandler._id,
        message: organizerMessage,
      });

      io.emit("groupUpdated", {
        organizerId: groupHandler._id.toString(),
        message: organizerMessage,
        date: new Date(),
        _id: organizerNotif._id,
        read: organizerNotif.read
      });
    }

    res.json({ success: true, message: "Member confirmed with deposit and added to group." });

  } catch (err) {
    console.error("❌ Confirm member error:", err);
    res.status(500).json({ error: err.message || "Server error while confirming membership." });
  }
  
});

app.post("/api/groups/:groupId/contribute-now", async (req, res) => {
  try {
    const { userId } = req.body;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // ✅ Prevent early contribution if group is not yet full
    if (group.members.length < group.slots) {
      return res.status(400).json({
        error: "Group is not yet full. Please wait for other members to join before contributing."
      });
    }

    // ✅ Prevent contribution if member is the payout recipient
    const payout = group.payouts[group.currentPayoutIndex || 0];
    const isPayoutRecipient = payout?.recipientId?.toString() === userId;
    if (isPayoutRecipient) {
      return res.status(400).json({ error: "You are the payout recipient this cycle." });
    }

    // ✅ Check if already contributed for this cycle
    const alreadyConfirmed = await MemberNotification.exists({
      userId,
      groupId,
      type: "contribution_confirmed",
      processed: false
    });
    if (alreadyConfirmed) {
      return res.status(400).json({ error: "Already contributed for this cycle." });
    }

    // ✅ Check wallet existence and balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    const amountPHP = Number(group.contributionAmount);
    if (wallet.balance < amountPHP) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // ✅ Exchange and blockchain interaction
    const { usdtAmount, rate } = await getUSDTFromPHP(amountPHP);
    const result = await contribute(group.contractAddress, group.tokenAddress, usdtAmount);
    if (!result.success) return res.status(500).json({ error: result.error });

    // ✅ Deduct balance and save wallet
    wallet.balance -= amountPHP;
    await wallet.save();

    // ✅ Update contribution count
    group.currentCycleContributions += 1;
    await group.save();

    // ✅ Save notification
    await MemberNotification.create({
      userId,
      groupId,
      type: "contribution_confirmed",
      message: `✅ You contributed ₱${amountPHP} early to "${group.name}".`,
      processed: false
    });

    // ✅ Log transaction
    const referenceId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    await Transaction.create({
      userId,
      type: "transfer",
      amount: amountPHP,
      amountUSDT: usdtAmount,
      exchangeRate: rate,
      referenceId,
      metadata: {
        groupId: group._id.toString(),
        to: `Group: ${group.name}`,
        method: "advance_payment"
      },
      status: "confirmed",
    });

    // ✅ Emit real-time notification
    const io = req.app.get("io");
    io.emit("memberNotification", {
      userId: userId.toString(),
      message: `✅ You contributed ₱${amountPHP} early to "${group.name}".`,
      date: new Date()
    });

    return res.json({ success: true, message: "Advance contribution successful." });

  } catch (err) {
    console.error("❌ Advance contribution error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/users/find", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    let users;

    // ✅ Check if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(query)) {
      console.log(`🔍 Searching by MongoDB _id: ${query}`);
      users = await User.find(
        { _id: query },
        { _id: 1, name: 1, email: 1 }
      );
    }
    // ✅ Search by short userId (8-character account number)
    else if (query.length === 8) {
      console.log(`🔍 Searching by userId shortcode: ${query}`);
      users = await User.find(
        { userId: query },
        { _id: 1, name: 1, email: 1, userId: 1 }
      );
    }
    // ✅ Search by Email
    else if (query.includes("@")) {
      console.log(`🔍 Searching by Email: ${query}`);
      users = await User.find(
        { email: query },
        { _id: 1, name: 1, email: 1, userId: 1 }
      );
    }
    // ✅ Search by Name (partial, case-insensitive)
    else {
      console.log(`🔍 Searching by Name: ${query}`);
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
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

//join groups
app.post("/api/join-group", async (req, res) => {
  try {
    const { userId, groupId, depositAmount } = req.body;

    if (!userId || !groupId || !depositAmount) {
      return res.status(400).json({ error: "User ID, Group ID and deposit amount are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.members = group.members.filter(member => member !== null && member !== undefined);

    if (group.members.length >= group.requiredMembers) {
      return res.status(400).json({ error: "Group is already full" });
    }

    if (group.members.some(member => member.userId.toString() === userId.toString())) {
      return res.status(400).json({ error: "User already joined" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    const minRequired = Number(group.contributionAmount);
    const parsedDeposit = Number(depositAmount);

    if (isNaN(parsedDeposit) || parsedDeposit <= 0) {
      return res.status(400).json({ error: "Deposit must be a valid amount" });
    }

    if (parsedDeposit < minRequired) {
      return res.status(400).json({
        error: `Minimum deposit is ₱${minRequired}. You entered ₱${parsedDeposit}`,
      });
    }

    if (wallet.balance < parsedDeposit) {
      return res.status(400).json({
        error: `Insufficient balance. You need at least ₱${parsedDeposit} to join.`,
      });
    }

    // Deduct
    wallet.balance -= parsedDeposit;
    await wallet.save();

    const referenceId = `SECURITY-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    await Transaction.create({
      userId,
      type: "deposit",
      amount: parsedDeposit,
      referenceId,
      metadata: {
        groupId: group._id.toString(),
        type: "security_deposit"
      },
      status: "confirmed",
    });

    group.members.push({
      userId: new mongoose.Types.ObjectId(userId),
      joinDate: new Date(),
      depositAmount: parsedDeposit
    });

    if (group.members.length >= group.requiredMembers) {
      group.status = "active";
      group.startDate = new Date();
      group.lastContributionDate = new Date(Date.now() - 5 * 60 * 1000);
      group.hasStarted = false;

      setTimeout(async () => {
        const Group = require("./models/Group");
        const { handleAutoContribution } = require("./jobs/tasks");
        const freshGroup = await Group.findById(group._id);
        if (freshGroup && !freshGroup.hasStarted) {
          await handleAutoContribution();
        }
      }, 5 * 60 * 1000);

      let frequencyDays = group.frequency === "Bi-Weekly" ? 14 : group.frequency === "Monthly" ? 30 : 7;
      const now = new Date();

      const sorted = [...group.members].sort((a, b) => {
        if (b.depositAmount !== a.depositAmount) return b.depositAmount - a.depositAmount;
        return new Date(a.joinDate) - new Date(b.joinDate);
      });

      group.payouts = sorted.map((member, index) => ({
        recipientId: member.userId,
        payoutDate: new Date(now.getTime() + index * frequencyDays * 24 * 60 * 60 * 1000),
      }));

      group.nextPayoutDate = group.payouts[0].payoutDate;

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

      const organizer = await User.findById(group.handler);
      if (organizer) {
        await Notification.create({
          organizerId: organizer._id,
          message: `🎉 Group "${group.name}" is now full. The payout cycle will start shortly.`,
        });

        io.emit("groupUpdated", {
          organizerId: organizer._id.toString(),
          message: `🎉 Group "${group.name}" is now full. The payout cycle will start shortly.`,
          date: new Date(),
        });
      }

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

    const organizer = await User.findById(group.handler);
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
    const organizerShare = totalPayout * 0.01;
    const superadminShare = totalPayout * 0.01;
    const recipientShare = totalPayout * 0.98;

    // 🏦 Payout to member
    recipient.balance += recipientShare;
    await recipient.save();

    const payoutId = `PAYOUT-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    await Transaction.create({
      userId: payout.recipientId,
      type: "receive",
      amount: recipientShare,
      referenceId: payoutId,
      metadata: {
        from: `Group: ${group.name}`,
        groupId: group._id.toString(),
        cycle: (group.currentPayoutIndex || 0) + 1,
      },
      status: "confirmed",
    });

    await MemberNotification.create({
      userId: payout.recipientId,
      message: `🎉 You received ₱${recipientShare.toFixed(2)} payout from group "${group.name}".`,
      type: "payout_received",
      groupId,
    });

    const io = req.app.get("io");
    io.emit("memberNotification", {
      userId: payout.recipientId.toString(),
      message: `🎉 You received ₱${recipientShare.toFixed(2)} payout from group "${group.name}".`,
      date: new Date(),
    });

    // 🏦 Payout to organizer
    const organizerWallet = await Wallet.findOne({ userId: group.handler });
    if (organizerWallet) {
      organizerWallet.balance += organizerShare;
      await organizerWallet.save();

      await Transaction.create({
        userId: group.handler,
        type: "receive",
        amount: organizerShare,
        referenceId: `ORGANIZER-${Date.now()}`,
        metadata: {
          groupId: group._id.toString(),
          type: "organizer_share",
        },
        status: "confirmed",
      });
    }

    // 🏦 Payout to superadmin
    const superadmin = await User.findOne({ role: "superadmin" });
    if (superadmin) {
      const superadminWallet = await Wallet.findOne({ userId: superadmin._id });
      if (superadminWallet) {
        superadminWallet.balance += superadminShare;
        await superadminWallet.save();

        await Transaction.create({
          userId: superadmin._id,
          type: "receive",
          amount: superadminShare,
          referenceId: `SYS-${Date.now()}`,
          metadata: {
            groupId: group._id.toString(),
            type: "system_share",
          },
          status: "confirmed",
        });
      }
    }

    // Reset group cycle
    group.currentCycleContributions = 0;
    group.currentPayoutIndex += 1;

    if (group.currentPayoutIndex >= group.payouts.length) {
      group.status = "completed";

      for (const member of group.members) {
        const wallet = await Wallet.findOne({ userId: member.userId });
        if (wallet && member.depositAmount > 0) {
          wallet.balance += member.depositAmount;
          await wallet.save();

          const refundRef = `REFUND-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
          await Transaction.create({
            userId: member.userId,
            type: "receive",
            amount: member.depositAmount,
            referenceId: refundRef,
            metadata: {
              groupId: group._id.toString(),
              type: "deposit_refund"
            },
            status: "confirmed"
          });

          await MemberNotification.create({
            userId: member.userId,
            groupId: group._id,
            type: "deposit_refund",
            message: `💰 Your initial deposit of ₱${member.depositAmount} for group "${group.name}" has been refunded.`,
            processed: true
          });

          io.emit("memberNotification", {
            userId: member.userId.toString(),
            message: `💰 Your initial deposit of ₱${member.depositAmount} for group "${group.name}" has been refunded.`,
            date: new Date()
          });
        }

        await MemberNotification.create({
          userId: member.userId,
          groupId: group._id,
          message: `✅ Group "${group.name}" has completed all payout cycles.`,
          type: "group_completed",
        });

        io.emit("memberNotification", {
          userId: member.userId.toString(),
          message: `✅ Group "${group.name}" has completed all payout cycles.`,
          date: new Date()
        });
      }

      await Notification.create({
        organizerId: group.handler,
        message: `🏁 Group "${group.name}" has completed all payout cycles.`,
      });

      io.emit("groupUpdated", {
        organizerId: group.handler.toString(),
        message: `🏁 Group "${group.name}" has completed all payout cycles.`,
        date: new Date(),
      });

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

  // ✅ Fetch Transactions for Specific Group
  app.get("/api/group-transactions/:groupId", async (req, res) => {
    try {
      const { groupId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({ error: "Invalid groupId format" });
      }
  
      const transactions = await Transaction.find({ "metadata.groupId": groupId }).sort({ createdAt: -1 }).populate('userId', 'name');
  
      const formatted = transactions.map((txn) => {
        const createdAt = txn.createdAt ? new Date(txn.createdAt) : new Date(); // 🛠️ FIXED
        return {
          id: txn.referenceId,
          name: txn.userId?.name || "Unknown", // 🛠️ FIXED
          contributed: txn.metadata?.to || txn.metadata?.from || "N/A",
          date: createdAt.toLocaleDateString(),
          time: createdAt.toLocaleTimeString(),
          status: txn.type === "transfer" ? "Deposit" : "Withdrawal",
        };
      });
  
      res.json(formatted);
    } catch (error) {
      console.error("❌ Error fetching group transactions:", error.message);
      res.status(500).json({ error: "Failed to fetch transactions" });
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
    const groups = await Group.find({ handler: organizer._id });

    if (groups.length === 0) {
      return res.status(200).json([]); // ✅ Return empty array
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

app.get("/api/notifications/:organizerId", async (req, res) => {
  try {
    const { organizerId } = req.params;
    
    const notifications = await Notification.find({ organizerId }).sort({ date: -1 });
    res.json(notifications);
  } catch (error) {
    console.error("❌ Error fetching organizer notifications:", error.message);
    res.status(500).json({ error: "Failed to fetch organizer notifications" });
  }
});


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

// ✅ PATCH to mark organizer notification as read
app.patch("/api/notifications/:id/read", async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(req.params.id, { read: true });
    if (!updated) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error marking notification as read:", err.message);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// ✅ DELETE organizer notification
app.delete("/api/notifications/:id", async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting notification:", err.message);
    res.status(500).json({ error: "Failed to delete notification" });
  }
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

app.post('/api/users/remove-fcm-token', async (req, res) => {
  try {
    const { fcmToken, userId } = req.body;

    if (!fcmToken || !userId) {
      return res.status(400).json({ error: 'Missing fcmToken or userId' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Optional: double-check token matches before clearing
    if (user.fcmToken !== fcmToken) {
      console.warn(`⚠️ Token mismatch for user ${user.email}`);
    }

    user.fcmToken = null;
    await user.save();

    res.json({ success: true, message: 'FCM token removed' });
  } catch (err) {
    console.error("❌ Error removing FCM token:", err.message);
    res.status(500).json({ error: "Failed to remove FCM token" });
  }
});

  
const cronJobs = require("./jobs/roscaScheduler");
cronJobs(io);

// ✅ Organizer Profile Routes
const profileRoutes = require("./routes/profileRoutes");
app.use("/api/profile", profileRoutes);
app.use(
  "/uploads/profile",
  express.static(path.join(__dirname, "uploads/profile"))
);

app.get("/api/secure-data", verifyToken, async (req, res) => {
  res.json({ message: "🔐 Secure route accessed", user: req.user });
});

app.use('/api/purchase', purchaseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));app.use('/api', require('./routes/groupRoutes'));
app.use('/api/reviews', require('./routes/reviews'));