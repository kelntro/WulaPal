const { getUSDTFromPHP } = require("../utils/exchange");

const { ethers } = require("ethers");
require("dotenv").config();

const WulaPalABI = require("../../blockchain/artifacts/contracts/WulaPal.sol/WulaPal.json");
const MockUSDTABI = require("../../blockchain/artifacts/contracts/MockUSDT.sol/MockUSDT.json");

const provider = new ethers.JsonRpcProvider(process.env.INFURA_AMOY_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function contributePHP(userId, contractAddress, phpAmount) {
    const { usdtAmount, rate } = await getUSDTFromPHP(phpAmount);
  
    const parsedAmount = ethers.parseUnits(usdtAmount.toString(), 6); // 6 decimals for USDT
  
    // ✅ approve & contribute logic here...
    console.log(`[CHAIN] Sending ${usdtAmount} USDT (₱${phpAmount}) at rate ₱${rate}/USDT`);
  }
  
// Deploy Mock USDT if needed
async function deployMockToken() {
    console.log("🚀 Deploying Mock USDT token...");
    const TokenFactory = new ethers.ContractFactory(MockUSDTABI.abi, MockUSDTABI.bytecode, wallet);
    const token = await TokenFactory.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("✅ Token deployed at:", tokenAddress);
    return tokenAddress;
}

const WulaPalFactory = new ethers.ContractFactory(WulaPalABI.abi, WulaPalABI.bytecode, wallet);

async function createGroup(contributionAmount, frequency, requiredMembers) {
    try {
        console.log(`🔹 Checking deployer balance...`);
        const balance = await provider.getBalance(wallet.address);
        console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH`);

        if (!contributionAmount || !frequency || !requiredMembers) {
            return { success: false, error: "Invalid contract parameters" };
        }

        // Step 1: Deploy token dynamically
        const tokenAddress = await deployMockToken();

        const superAdminAddress = wallet.address;

        console.log(`🚀 Deploying WulaPal contract...`);
        const wulapal = await WulaPalFactory.deploy(
            tokenAddress,
            ethers.parseUnits(contributionAmount.toString(), 6),
            frequency,
            requiredMembers,
            superAdminAddress
        );

        await wulapal.waitForDeployment();
        const contractAddress = await wulapal.getAddress();

        console.log(`✅ WulaPal Contract deployed at: ${contractAddress}`);
        return { success: true, contractAddress, tokenAddress };

    } catch (error) {
        console.error("❌ Deployment Error:", error);
        return { success: false, error: error.reason || error.message };
    }
}

async function contribute(contractAddress, tokenAddress, amount) {
    try {
        const stableToken = new ethers.Contract(tokenAddress, [
            "function approve(address spender, uint256 amount) public returns (bool)"
        ], wallet);

        const parsedAmount = ethers.parseUnits(amount.toString(), 6);

        console.log(`🔐 Approving ${amount} tokens to ${contractAddress}`);
        const approveTx = await stableToken.approve(contractAddress, parsedAmount);
        await approveTx.wait();

        const contract = new ethers.Contract(contractAddress, WulaPalABI.abi, wallet);
        const tx = await contract.contribute();
        await tx.wait();

        console.log(`✅ Contribution successful: ${tx.hash}`);
        return { success: true, txHash: tx.hash };

    } catch (error) {
        console.error("❌ Error in contribute:", error);
        return { success: false, error: error.message };
    }
}

async function getContractBalance(contractAddress, tokenAddress) {
    try {
        const stableToken = new ethers.Contract(tokenAddress, [
            "function balanceOf(address) view returns (uint256)"
        ], provider);

        const balance = await stableToken.balanceOf(contractAddress);
        return {
            success: true,
            balance: ethers.formatUnits(balance, 6)
        };
    } catch (error) {
        console.error("❌ Error getting contract balance:", error);
        return { success: false, error: error.message };
    }
}

async function triggerPayout(contractAddress) {
    try {
      const contract = new ethers.Contract(contractAddress, WulaPalABI.abi, wallet);
  
      console.log("🔁 Triggering smart contract payout...");
      const tx = await contract.automaticPayout();
      await tx.wait();
  
      console.log(`✅ Payout executed successfully: ${tx.hash}`);
      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error("❌ Error triggering payout:", error);
      return { success: false, error: error.message };
    }
  }

module.exports = {
    createGroup,
    contribute,
    getContractBalance,
    triggerPayout
};
