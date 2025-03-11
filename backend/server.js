const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { createGroup, contribute, getContractBalance } = require("./services/wulapalService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const socketIo = require("socket.io");
const os = require("os");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());


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


// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define and Register the Group Schema
const GroupSchema = new mongoose.Schema({
    name: String,
    contributionAmount: String,
    frequency: String,
    requiredMembers: Number,
    image: String,
    description: String,
    slots: Number,
    handler: String,
    contractAddress: String, // Store contract address
    members: { type: Array, default: [] }, // Track members who joined
    status: { type: String, default: "open" } // "open" or "active"
});


const Group = mongoose.model("Group", GroupSchema);

// ✅ Update `/api/create-group` to Emit Event When New Group is Created
app.post("/api/create-group", async (req, res) => {
    try {
        console.log("📥 Received request to create group:", req.body);

        const { name, contributionAmount, frequency, requiredMembers, image, description, slots, handler } = req.body;

        if (!name || !contributionAmount || !frequency || !requiredMembers || !slots) {
            console.error("❌ Missing required fields");
            return res.status(400).json({ error: "Missing required fields" });
        }

        console.log("🚀 Deploying contract to blockchain...");
        const blockchainResult = await createGroup(contributionAmount, frequency, requiredMembers);

        if (!blockchainResult.success) {
            console.error("❌ Blockchain Deployment Failed:", blockchainResult.error);
            return res.status(500).json({ error: blockchainResult.error });
        }

        console.log("📦 Saving group to MongoDB...");
        const newGroup = new Group({
            name,
            contributionAmount,
            frequency: frequency === 604800 ? "Weekly" : "Monthly",
            requiredMembers,
            image: image.startsWith("http") ? image : `${SERVER_URL}/uploads/${path.basename(image)}`,
            description,
            slots,
            handler,
            contractAddress: blockchainResult.contractAddress,
            members: [],
            status: "open",
        });

        await newGroup.save();
        console.log("✅ Group saved successfully:", newGroup);

        // ✅ Emit event to notify all connected clients
        io.emit("newGroup", newGroup);

        res.json({ success: true, group: newGroup });
    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ error: error.message });
    }
});

    
app.post("/api/contribute", async (req, res) => {
    try {
        const { amount } = req.body;
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
        const updatedGroups = groups.map(group => ({
            ...group._doc,
            image: group.image.startsWith("http") ? group.image : `${SERVER_URL}/uploads/${path.basename(group.image)}`

        }));

        console.log("📤 Sending groups data:", updatedGroups);
        res.json(updatedGroups);
    } catch (error) {
        console.error("❌ Error fetching groups:", error);
        res.status(500).json({ error: error.message });
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
        if (group.members.some(member => member.toString() === userId.toString())) {
            return res.status(400).json({ error: "User already joined" });
        }

        group.members.push(userId);

        // If full, update status to active
        if (group.members.length >= group.requiredMembers) {
            group.status = "active"; // Change status to active
        }

        await group.save();
        io.emit("groupUpdated", group); // Notify clients
        res.json({ success: true, group });
    } catch (error) {
        console.error("❌ Error joining group:", error);
        res.status(500).json({ error: error.message });
    }
});


const startRoscaPayout = async (group) => {
    console.log(`🔄 Starting ROSCA for group ${group.name}`);

    // Select a random member for payout
    const randomIndex = Math.floor(Math.random() * group.members.length);
    const winner = group.members[randomIndex];

    console.log(`💰 Payout for ${winner}`);

    io.emit("roscaPayout", { groupId: group._id, winner });

    // Implement blockchain smart contract function call for payout
};

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
            return res.status(404).json({ error: "No groups found for this organizer" });
        }

        // Format the response properly
        const formattedGroups = groups.map(group => ({
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
            updatedAt: group.updatedAt
        }));

        console.log(`✅ Fetched ${formattedGroups.length} groups for organizer: ${organizer.name}`);
        res.json(formattedGroups);
    } catch (error) {
        console.error("❌ Server Error:", error.message, error.stack);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
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
        transports: ["websocket", "polling"]
    }
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
    socket.emit("serverConnected", { message: "WebSocket Connected Successfully" });
});

// ✅ Serve Uploaded Images Publicly
app.use("/uploads", express.static(uploadDir));

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`✅ WebSocket & Backend running on port ${PORT}`));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
