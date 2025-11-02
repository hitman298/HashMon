const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying HashMon contract to Pharos Network...");

  // Get the contract factory
  const HashMon = await ethers.getContractFactory("HashMon");

  // Get the deployer address
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contract with account:", deployer.address);
  
  // Deploy the contract
  console.log("📝 Deploying contract...");
  const hashmon = await HashMon.deploy(deployer.address);

  // Wait for deployment to complete
  await hashmon.waitForDeployment();

  const address = await hashmon.getAddress();
  console.log("✅ HashMon deployed successfully!");
  console.log("📍 Contract address:", address);
  console.log("🌐 Network:", hre.network.name);
  console.log("🔗 Chain ID:", hre.network.config.chainId);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  try {
    const battleLogsCount = await hashmon.getBattleLogsCount();
    console.log("✅ Contract is working! Battle logs count:", battleLogsCount.toString());
  } catch (error) {
    console.log("⚠️ Contract deployed but verification failed:", error.message);
  }

  console.log("\n📋 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update backend/.env with HASHMON_CONTRACT_ADDRESS=" + address);
  console.log("3. Update frontend/.env with VITE_HASHMON_CONTRACT_ADDRESS=" + address);
  console.log("4. Start your backend and frontend servers");

  // Save deployment info
  const deploymentInfo = {
    contractAddress: address,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString(),
    deployer: await hashmon.runner.getAddress()
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("💾 Deployment info saved to deployment-info.json");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
