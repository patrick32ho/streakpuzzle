import { ethers, network, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Network:", network.name);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Server signer address - should be set in env vars
  const serverSigner = process.env.SERVER_SIGNER_ADDRESS || deployer.address;
  console.log("Server signer:", serverSigner);

  // Base URI for token metadata
  const baseUri = process.env.NEXT_PUBLIC_URL 
    ? `${process.env.NEXT_PUBLIC_URL}/api/metadata/` 
    : "https://gridoftheday.xyz/api/metadata/";

  // Deploy GridBadges
  console.log("\n📦 Deploying GridBadges...");
  const GridBadges = await ethers.getContractFactory("GridBadges");
  const gridBadges = await GridBadges.deploy(
    `${baseUri}badges/{id}`,
    serverSigner
  );
  await gridBadges.waitForDeployment();
  const badgesAddress = await gridBadges.getAddress();
  console.log("✅ GridBadges deployed to:", badgesAddress);

  // Deploy GridFrames
  console.log("\n📦 Deploying GridFrames...");
  const GridFrames = await ethers.getContractFactory("GridFrames");
  const gridFrames = await GridFrames.deploy(
    `${baseUri}frames/{id}`,
    serverSigner
  );
  await gridFrames.waitForDeployment();
  const framesAddress = await gridFrames.getAddress();
  console.log("✅ GridFrames deployed to:", framesAddress);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    serverSigner,
    contracts: {
      GridBadges: badgesAddress,
      GridFrames: framesAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  // Write to lib/contracts
  const contractsDir = path.join(__dirname, "..", "lib", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, `deployment-${network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Also save ABIs
  const badgesArtifact = require("../artifacts/contracts/GridBadges.sol/GridBadges.json");
  const framesArtifact = require("../artifacts/contracts/GridFrames.sol/GridFrames.json");

  fs.writeFileSync(
    path.join(contractsDir, "GridBadges.json"),
    JSON.stringify({ abi: badgesArtifact.abi, address: badgesAddress }, null, 2)
  );

  fs.writeFileSync(
    path.join(contractsDir, "GridFrames.json"),
    JSON.stringify({ abi: framesArtifact.abi, address: framesAddress }, null, 2)
  );

  console.log("\n📝 Deployment info saved to lib/contracts/");

  // Verify contracts on Basescan (skip for local)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

    console.log("\n🔍 Verifying GridBadges on Basescan...");
    try {
      await run("verify:verify", {
        address: badgesAddress,
        constructorArguments: [`${baseUri}badges/{id}`, serverSigner],
      });
      console.log("✅ GridBadges verified");
    } catch (error: any) {
      console.log("⚠️ Verification failed:", error.message);
    }

    console.log("\n🔍 Verifying GridFrames on Basescan...");
    try {
      await run("verify:verify", {
        address: framesAddress,
        constructorArguments: [`${baseUri}frames/{id}`, serverSigner],
      });
      console.log("✅ GridFrames verified");
    } catch (error: any) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment complete!");
  console.log("\n--- Environment Variables to set ---");
  console.log(`NEXT_PUBLIC_CONTRACT_BADGES=${badgesAddress}`);
  console.log(`NEXT_PUBLIC_CONTRACT_FRAMES=${framesAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
