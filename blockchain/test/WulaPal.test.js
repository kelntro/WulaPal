const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WulaPal Contract", function () {
    let WulaPal, wulapal, owner, addr1, addr2, addr3;
    const contributionAmount = ethers.parseEther("500");
    const frequency = 30 * 24 * 60 * 60;
    const requiredMembers = 12; // Fix: Added requiredMembers argument

    beforeEach(async function () {
        WulaPal = await ethers.getContractFactory("WulaPal");
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        wulapal = await WulaPal.deploy(contributionAmount, frequency, requiredMembers); // Fix: Added missing arguments
        await wulapal.waitForDeployment();
    });

    it("Should allow users to join before the group is started", async function () {
        await wulapal.connect(addr1).joinPaluwagan();
        await wulapal.connect(addr2).joinPaluwagan();
        await wulapal.connect(addr3).joinPaluwagan();
        expect(await wulapal.totalMembers()).to.equal(3);
    });
});
