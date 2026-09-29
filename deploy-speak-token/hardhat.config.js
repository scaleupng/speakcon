require("dotenv").config({ path: "../backend/.env" });
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  paths: { sources: "./contracts" },
  networks: {
    bscTestnet: {
      url: process.env.BSC_RPC_URL,
      accounts: [process.env.TREASURY_PRIVATE_KEY],
      chainId: 97,
    },
    bscMainnet: {
      url: process.env.BSC_MAINNET_RPC_URL || process.env.BSC_RPC_URL,
      accounts: [process.env.TREASURY_PRIVATE_KEY],
      chainId: 56,
    },
  },
};
