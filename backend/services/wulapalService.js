const { ethers } = require("ethers");
const WulaPalABI = require("../../blockchain/artifacts/contracts/WulaPal.sol/WulaPal.json");
require("dotenv").config();

//const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const provider = new ethers.JsonRpcProvider(process.env.INFURA_AMOY_URL);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const WulaPalFactory = new ethers.ContractFactory(WulaPalABI.abi, WulaPalABI.bytecode, wallet);

async function createGroup(contributionAmount, frequency, requiredMembers) {
    try {
        console.log(`🔹 Checking deployer balance...`);
        const balance = await provider.getBalance(wallet.address);
        console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH`);

        if (!contributionAmount || !frequency || !requiredMembers) {
            console.error("❌ Error: Invalid contract parameters");
            return { success: false, error: "Invalid contract parameters" };
        }

        console.log(`🚀 Deploying contract with ${requiredMembers} members...`);

        const wulapal = await WulaPalFactory.deploy(
            ethers.parseUnits(contributionAmount.toString(), "ether"), // Convert to wei
            frequency,
            requiredMembers
        );

        await wulapal.waitForDeployment();
        const contractAddress = await wulapal.getAddress();

        console.log(`✅ Smart Contract Deployed at: ${contractAddress}`);
        return { success: true, contractAddress };

    } catch (error) {
        console.error("❌ Deployment Error:", error);
        return { success: false, error: error.reason || error.message };
    }
}


// Function to allow users to contribute to the contract
async function contribute(userAddress, amount) {
    try {
        console.log(`🔹 User ${userAddress} contributing ${amount} ETH`);
        
        const signer = wallet.connect(provider);
        const userContract = new ethers.Contract(userAddress, WulaPalABI.abi, signer);
        
        const tx = await userContract.contribute({ value: ethers.parseEther(amount.toString()) });
        await tx.wait();
        
        console.log(`✅ Contribution successful: ${tx.hash}`);
        return { success: true, txHash: tx.hash };
    } catch (error) {
        console.error("❌ Error in contribute:", error);
        return { success: false, error: error.message };
    }
}

// Function to get contract balance
async function getContractBalance(contractAddress) {
    try {
        const balance = await provider.getBalance(contractAddress);
        return { success: true, balance: ethers.formatEther(balance) };
    } catch (error) {
        console.error("❌ Error getting contract balance:", error);
        return { success: false, error: error.message };
    }
}

module.exports = { createGroup, contribute, getContractBalance };
