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
const { sendPushToUser } = require("./services/pushService");
const { processContribution } = require('./services/contributionQueue');

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
    const io = req.app.get("io");
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

    if (group.members.length >= group.requiredMembers && group.status !== "active") {
      group.status = "active";
      group.startDate = new Date();
      group.lastContributionDate = new Date(Date.now() - 5 * 60 * 1000); // Start timer
      group.hasStarted = false;
    
      // Schedule first auto-contribution trigger
      setTimeout(async () => {
        const Group = require("./models/Group");
        const { handleAutoContribution } = require("./jobs/tasks");
        const freshGroup = await Group.findById(group._id);
        if (freshGroup && !freshGroup.hasStarted) {
          await handleAutoContribution();
        }
      }, 5 * 60 * 1000);
    
      // Determine frequency in days
      let frequencyDays = group.frequency === "Bi-Weekly" ? 14 : group.frequency === "Monthly" ? 30 : 7;
      const now = new Date();
    
      // Sort by deposit amount then join date
      const sorted = [...group.members].sort((a, b) => {
        if (b.depositAmount !== a.depositAmount) return b.depositAmount - a.depositAmount;
        return new Date(a.joinDate) - new Date(b.joinDate);
      });
    
      group.payouts = sorted.map((member, index) => ({
        recipientId: member.userId,
        payoutDate: new Date(now.getTime() + index * frequencyDays * 24 * 60 * 60 * 1000),
      }));
    
      group.nextPayoutDate = group.payouts[0].payoutDate;
    
      // Notify all members about their payout schedule
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
    
      // Notify organizer
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
    
      // Notify each member
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

    if (group.members.length < group.slots) {
      return res.status(400).json({ error: "Group is not yet full." });
    }

    if (group.currentPayoutIndex >= group.payouts.length) {
      return res.status(400).json({ error: "All payouts completed." });
    }

    const payout = group.payouts[group.currentPayoutIndex];
    if (payout?.recipientId?.toString() === userId) {
      return res.status(400).json({ error: "You are the payout recipient this cycle." });
    }

    // Check if user has already contributed in current cycle
    const alreadyConfirmed = await MemberNotification.exists({
      userId,
      groupId,
      type: { $in: ["contribution_confirmed", "contribution_processed"] },
      processed: true,
      cycle: group.currentPayoutIndex
    });    

    if (alreadyConfirmed) {
      // Calculate next cycle date
      const frequencyDays = group.frequency === "Bi-Weekly" ? 14 : group.frequency === "Monthly" ? 30 : 7;
      const nextCycleDate = new Date(group.lastContributionDate.getTime() + frequencyDays * 24 * 60 * 60 * 1000);
      
      return res.status(400).json({ 
        error: "Already contributed this cycle.",
        nextCycleDate: nextCycleDate.toISOString(),
        message: `You've already contributed for this cycle. Next cycle starts on ${nextCycleDate.toLocaleDateString()}`
      });
    }

    const expectedContributions = group.requiredMembers - 1;
    if (group.currentCycleContributions >= expectedContributions) {
      return res.status(400).json({
        error: "All contributions for this cycle are already received."
      });
    }

    const amountPHP = Number(group.contributionAmount);
    const result = await processContribution(userId, groupId, amountPHP);

    // Calculate next cycle date for response
    const frequencyDays = group.frequency === "Bi-Weekly" ? 14 : group.frequency === "Monthly" ? 30 : 7;
    const nextCycleDate = new Date(group.lastContributionDate.getTime() + frequencyDays * 24 * 60 * 60 * 1000);

    return res.json({ 
      success: true, 
      message: "Payment successful and payout processed if due.",
      nextCycleDate: nextCycleDate.toISOString()
    });

  } catch (err) {
    console.error("❌ contribute-now error:", err.message);
    return res.status(500).json({ error: err.message || "Server error" });
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

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
      
    // Check if current cycle is valid (should not exceed number of members)
    if (group.currentPayoutIndex >= group.members.length) {
      // Process refunds when group is completed
      for (const member of group.members) {
        if (member.depositAmount > 0) {
          const wallet = await Wallet.findOne({ userId: member.userId });
          if (wallet) {
            wallet.balance += member.depositAmount;
            await wallet.save();

            await Transaction.create({
              userId: member.userId,
              type: "refund",
              amount: member.depositAmount,
              referenceId: `REFUND-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
              metadata: {
                groupId: group._id.toString(),
                type: "deposit_refund"
              },
              status: "confirmed"
            });

            await MemberNotification.create({
              userId: member.userId,
              groupId: group._id,
              message: `💰 Your ₱${member.depositAmount} deposit was refunded after group "${group.name}" completed.`,
              type: "deposit_refunded"
            });

            await sendPushToUser(
              member.userId.toString(),
              "WulaPal",
              `💰 Your ₱${member.depositAmount} deposit for group "${group.name}" was refunded.`
            );
          }
        }
      }

      group.status = "completed";
      await group.save();

      return res.status(400).json({ 
        error: "All cycles have been completed for this group. Deposits have been refunded."
      });
    }

    // Check if user is the current payout recipient
    const currentPayout = group.payouts[group.currentPayoutIndex];
    const isCurrentRecipient = currentPayout?.recipientId?.toString() === userId;
    if (isCurrentRecipient) {
      return res.status(400).json({ 
        error: `You are the payout recipient for cycle ${group.currentPayoutIndex + 1}. You don't need to contribute this cycle.`
      });
    }

    // Check if user has already contributed in current cycle
    const alreadyConfirmed = await MemberNotification.exists({
      userId,
      groupId,
      type: { $in: ["contribution_confirmed", "contribution_processed"] },
      processed: true,
      cycle: group.currentPayoutIndex
    });
      
    if (alreadyConfirmed) {
      return res.status(400).json({ 
        error: `You've already contributed for cycle ${group.currentPayoutIndex + 1}.`
      });
    }

    // Check if cycle is already complete
    const expectedContributions = group.requiredMembers - 1;
    if (group.currentCycleContributions >= expectedContributions) {
      return res.status(400).json({
        error: "This cycle already has enough contributions."
      });
    }

    const amountPHP = Number(group.contributionAmount);
    const result = await processContribution(userId, groupId, amountPHP);

    res.json({ 
      success: true, 
      message: "Contribution processed successfully.",
      cycle: group.currentPayoutIndex + 1
    });

  } catch (err) {
    console.error("❌ Error processing contribution:", err.message);
    res.status(500).json({ error: err.message || "Failed to process contribution." });
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

app.post("/api/groups/:groupId/request-join", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingRequest = await MemberNotification.findOne({
      userId,
      groupId,
      type: "join_request",
      processed: false,
    });

    if (existingRequest) {
      return res.status(400).json({ error: "You already requested to join this group." });
    }

    await MemberNotification.create({
      userId,
      groupId,
      type: "join_request",
      message: `📥 ${user.name} requested to join the group "${group.name}".`,
      processed: false,
    });    

    // Notify organizer
    const notifMessage = `👤 ${user.name} requested to join group "${group.name}". Review their profile.`;
    await Notification.create({
      organizerId: group.handler,
      message: notifMessage,
    });

    const io = req.app.get("io");
    io.emit("groupUpdated", {
      organizerId: group.handler.toString(),
      message: notifMessage,
      date: new Date(),
    });

    res.json({ success: true, message: "Join request sent." });
  } catch (err) {
    console.error("❌ Join request error:", err.message);
    res.status(500).json({ error: "Failed to send join request." });
  }
});

app.get("/api/organizer/join-requests/:organizerId", async (req, res) => {
  try {
    const { organizerId } = req.params;

    const groups = await Group.find({ handler: organizerId });
    const groupIds = groups.map(g => g._id);

    const requests = await MemberNotification.find({
      groupId: { $in: groupIds },
      type: "join_request",
      processed: false
    }).sort({ date: -1 });

    res.json(requests);
  } catch (err) {
    console.error("❌ Error fetching organizer join requests:", err.message);
    res.status(500).json({ error: "Failed to fetch join requests." });
  }
});

app.post("/api/groups/:groupId/approve-request", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    const user = await User.findById(userId);
    if (!group || !user) return res.status(404).json({ error: "Group or user not found" });

    // Mark join request as processed
    await MemberNotification.updateMany({
      userId,
      groupId,
      type: "join_request",
      processed: false,
    }, { processed: true });

    // Send member_invite notification
    const message = `✅ You've been approved to join the group "${group.name}". Tap to pay your initial deposit.`;
    await MemberNotification.create({
      userId,
      groupId,
      type: "member_invite",
      message,
      processed: false,
    });

    const io = req.app.get("io");
    io.emit("memberNotification", {
      userId,
      message,
      date: new Date()
    });

    res.json({ success: true, message: "User approved and notified." });
  } catch (err) {
    console.error("❌ Approve request error:", err.message);
    res.status(500).json({ error: "Failed to approve request." });
  }
});

app.post("/api/groups/:groupId/decline-request", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    // ✅ Mark the join_request as processed (declined)
    await MemberNotification.updateMany(
      { userId, groupId, type: "join_request", processed: false },
      { processed: true }
    );

    // ✅ Send decline feedback to member
    const message = `❌ Your request to join group has been declined.`;
    await MemberNotification.create({
      userId,
      groupId,
      type: "join_request",
      message,
      processed: true,
    });

    const io = req.app.get("io");
    io.emit("memberNotification", {
      userId,
      message,
      date: new Date()
    });

    res.json({ success: true, message: "Request declined and member notified." });
  } catch (err) {
    console.error("❌ Decline request error:", err.message);
    res.status(500).json({ error: "Failed to decline request." });
  }
});

app.use('/api/purchase', purchaseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));app.use('/api', require('./routes/groupRoutes'));
app.use('/api/reviews', require('./routes/reviews'));

// ✅ Check if user has already contributed for current cycle
app.get("/api/groups/:groupId/check-contribution", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.query;

    if (!userId || !groupId) {
      return res.status(400).json({ error: "Missing userId or groupId" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Check if user is the current payout recipient
    const currentPayout = group.payouts[group.currentPayoutIndex];
    const isCurrentRecipient = currentPayout?.recipientId?.toString() === userId;

    // Check if user has already contributed in current cycle
    const alreadyConfirmed = await MemberNotification.exists({
      userId,
      groupId,
      type: { $in: ["contribution_confirmed", "contribution_processed"] },
      processed: true,
      cycle: group.currentPayoutIndex
    });    

    // Check if cycle is already complete
    const expectedContributions = group.requiredMembers - 1;
    const cycleComplete = group.currentCycleContributions >= expectedContributions;

    // Calculate next cycle date based on frequency
    let frequencyDays = group.frequency === "Bi-Weekly" ? 14 : group.frequency === "Monthly" ? 30 : 7;
    const nextCycleDate = new Date(group.lastContributionDate.getTime() + frequencyDays * 24 * 60 * 60 * 1000);

    res.json({
      hasContributed: alreadyConfirmed,
      isCurrentRecipient,
      cycleComplete,
      nextCycleDate: nextCycleDate.toISOString(),
      currentCycle: group.currentPayoutIndex
    });

  } catch (err) {
    console.error("❌ Error checking contribution:", err.message);
    res.status(500).json({ error: "Failed to check contribution status." });
  }
});

// Add this endpoint for audit trail
app.get("/api/group-transactions/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Find all transactions related to this group
    const transactions = await Transaction.find({
      'metadata.groupId': groupId
    }).populate('userId', 'name email').sort({ timestamp: -1 });

    // Format the transactions for the frontend
    const formattedTransactions = transactions.map(tx => ({
      referenceId: tx.referenceId,
      user: tx.userId.name,
      type: tx.type,
      amountPHP: tx.amount,
      amountUSDT: tx.amountUSDT,
      status: tx.status,
      date: new Date(tx.timestamp).toLocaleDateString(),
      time: new Date(tx.timestamp).toLocaleTimeString(),
      txHash: tx.txHash,
      metadata: tx.metadata
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error("❌ Error fetching group transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});