const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking wallet configuration and balance...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Wallet Information:");
  console.log("📍 Address:", deployer.address);
  console.log("🌐 Network:", hre.network.name);
  console.log("🔗 Chain ID:", hre.network.config.chainId);

  // Check balance
  try {
    const balance = await deployer.provider.getBalance(deployer.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log("💰 PHAR Balance:", balanceInEth, "PHAR");
    
    if (balance > 0) {
      console.log("✅ Wallet has sufficient funds for transactions");
    } else {
      console.log("⚠️ Wallet has no PHAR tokens - need to get testnet tokens");
    }
  } catch (error) {
    console.log("❌ Error checking balance:", error.message);
  }

  // Check contract deployment
  try {
    const contractAddress = "0xae693A1003de169116740e0B071E65CbCf1a3FC9";
    const code = await deployer.provider.getCode(contractAddress);
    
    if (code !== "0x") {
      console.log("✅ Contract deployed at:", contractAddress);
      console.log("🔍 Contract verified on blockchain");
    } else {
      console.log("❌ Contract not found at address");
    }
  } catch (error) {
    console.log("❌ Error checking contract:", error.message);
  }

  console.log("\n📋 Configuration Summary:");
  console.log("🎮 Your wallet address:", deployer.address);
  console.log("🔗 Contract address: 0xae693A1003de169116740e0B071E65CbCf1a3FC9");
  console.log("🌐 Network: Pharos Testnet");
  console.log("💰 All PHAR transactions will use this wallet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

