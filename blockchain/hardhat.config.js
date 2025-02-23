require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {},
    amoy: {
      url: process.env.INFURA_AMOY_URL, // Amoy Testnet
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com", // Mumbai Testnet
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    polygon: {
      url: "https://polygon-rpc.com", // Polygon Mainnet
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
