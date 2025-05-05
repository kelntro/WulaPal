const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying WulaPal contract with owner: ${deployer.address}`);

  // ✅ Shared stable token address (should already be deployed)
  const tokenAddress = process.env.STABLE_TOKEN_ADDRESS;
  if (!tokenAddress) {
    throw new Error("❌ STABLE_TOKEN_ADDRESS not set in .env");
  }

  // ✅ ROSCA group parameters
  const contributionAmount = hre.ethers.parseUnits("10", 6); // 10 USDT (6 decimals)
  const frequency = 30 * 24 * 60 * 60; // Monthly
  const requiredMembers = 12;
  const superAdmin = deployer.address; // You can also hardcode a different address if needed

  // ✅ Deploy WulaPal using all 5 required constructor arguments
  const WulaPal = await hre.ethers.getContractFactory("WulaPal");
  const wulapal = await WulaPal.deploy(
    tokenAddress,
    contributionAmount,
    frequency,
    requiredMembers,
    superAdmin
  );

  await wulapal.waitForDeployment();
  const contractAddress = await wulapal.getAddress();

  console.log(`✅ WulaPal deployed at: ${contractAddress}`);
  console.log(`🔗 Token address used: ${tokenAddress}`);
}

main().catch((error) => {
  console.error("❌ Deployment error:", error);
  process.exitCode = 1;
});
