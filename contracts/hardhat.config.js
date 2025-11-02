require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Pharos Atlantic Testnet
    "pharos-atlantic": {
      url: "https://atlantic.dplabs-internal.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 688689,
      gasPrice: "auto"
    },
    // Pharos Testnet
    pharos: {
      url: "https://testnet.dplabs-internal.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 688688,
      gasPrice: "auto"
    },
    // Local development
    hardhat: {
      chainId: 31337
    }
  },
  etherscan: {
    customChains: [
      {
        network: "pharos-atlantic",
        chainId: 688689,
        urls: {
          apiURL: "https://api.socialscan.io/pharos-atlantic-testnet/v1/explorer/command_api/contract",
          browserURL: "https://pharos-atlantic-testnet.socialscan.io",
        },
      },
      {
        network: "pharos",
        chainId: 688688,
        urls: {
          apiURL: "https://api.socialscan.io/pharos-testnet/v1/explorer/command_api/contract",
          browserURL: "https://testnet.pharosscan.xyz/",
        },
      },
    ],
    apiKey: {
      "pharos-atlantic": "hashmon-game",
      pharos: "hashmon-game",
    },
  }
};
