require("dotenv").config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    polygon: {
      url: process.env.POLYGON_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined
          ? [
              process.env.PRIVATE_KEY,
              "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
            ]
          : [],
    },
    baseGoerli: {
      url: "https://goerli.base.org",
      accounts:
        process.env.PRIVATE_KEY !== undefined
          ? [
              process.env.PRIVATE_KEY,
              "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
            ]
          : [],
      gasPrice: 200000000,
    },
    hardhat: {
      mining: {
        auto: false,
        interval: 500,
      },
      chainId: 200,
    },
  },
  mocha: {
    timeout: 480000,
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.SCAN_KEY || "",
    },
  },
};

export default config;
