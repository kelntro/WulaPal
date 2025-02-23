const express = require("express");
const cors = require("cors");
const { createGroup, contribute, getContractBalance } = require("./services/wulapalService");

const app = express();
app.use(cors());
app.use(express.json());

let groups = [];

app.post("/api/create-group", async (req, res) => {
    try {
        const { contributionAmount, frequency, requiredMembers } = req.body;

        const result = await createGroup(contributionAmount, frequency, requiredMembers);

        if (!result.success) {
            throw new Error(result.error);
        }

        // Convert frequency from seconds to readable format
        const formattedFrequency = frequency === 604800 ? "Weekly" : "Monthly";

        const newGroup = {
            id: groups.length + 1,
            contractAddress: result.contractAddress,
            contributionAmount,
            frequency: formattedFrequency, // Store as "Weekly" or "Monthly"
            requiredMembers
        };

        groups.push(newGroup);

        res.json(newGroup);
    } catch (error) {
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

app.get("/api/groups", (req, res) => {
    res.json(groups);
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
