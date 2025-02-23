const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contract with owner: ${deployer.address}`);

  const contributionAmount = hre.ethers.parseEther("10"); // Example value, should be dynamic
  const frequency = 30 * 24 * 60 * 60; // Monthly cycle
  const requiredMembers = 12; // Organizer sets number of members

  const WulaPal = await hre.ethers.getContractFactory("WulaPal");
  const wulapal = await WulaPal.deploy(contributionAmount, frequency, requiredMembers);
  await wulapal.waitForDeployment();

  console.log(`✅ WulaPal deployed to: ${await wulapal.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
