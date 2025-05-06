const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Deploying MockUSDT from:", deployer.address);

  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const token = await MockUSDT.deploy();
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log(`✅ MockUSDT deployed at: ${tokenAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
