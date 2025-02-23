const { ethers } = require("ethers");
const WulaPalABI = require("../../blockchain/artifacts/contracts/WulaPal.sol/WulaPal.json");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const WulaPalFactory = new ethers.ContractFactory(WulaPalABI.abi, WulaPalABI.bytecode, wallet);

async function createGroup(contributionAmount, frequency, requiredMembers) {
    console.log(`🔹 Checking deployer balance...`);
    
    // ✅ FIXED: Use provider to check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH`);

    if (balance < ethers.parseEther("0.1")) {  // Ensure at least 0.1 ETH
        console.error("❌ Error: Not enough funds to deploy contract!");
        return { success: false, error: "Not enough funds to deploy contract" };
    }

    console.log(`🔹 Deploying new WulaPal contract for group with ${requiredMembers} members`);

    try {
        const wulapal = await WulaPalFactory.deploy(
            ethers.parseEther(contributionAmount.toString()), 
            frequency, 
            requiredMembers
        );
        await wulapal.waitForDeployment();
        const contractAddress = await wulapal.getAddress();

        console.log(`✅ Group contract deployed at: ${contractAddress}`);
        return { success: true, contractAddress };
    } catch (error) {
        console.error("❌ Deployment failed!");

        // Extract useful error message
        let cleanError = "Unknown error";
        if (error.reason) {
            cleanError = error.reason;  // Catch readable Hardhat error
        } else if (error.message) {
            cleanError = error.message.split("\n")[0]; // Remove long hash values
        }

        console.error(`❌ Error: ${cleanError}`);
        return { success: false, error: cleanError };
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
