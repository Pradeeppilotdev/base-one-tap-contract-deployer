import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying ContractFactory to Base...\n");

  // Get the contract factory
  const ContractFactory = await hre.ethers.getContractFactory("ContractFactory");
  
  // Deploy the contract
  console.log("Deploying ContractFactory...");
  const factory = await ContractFactory.deploy();
  
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  
  console.log("\n✅ ContractFactory deployed!");
  console.log("Address:", factoryAddress);
  console.log("\n📝 Update FACTORY_CONTRACT_ADDRESS in components/ContractDeployer.tsx with:");
  console.log(`const FACTORY_CONTRACT_ADDRESS = '${factoryAddress}';`);
  
  // Verify on BaseScan if API key is set
  if (process.env.BASESCAN_API_KEY) {
    console.log("\n⏳ Waiting for block confirmations before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    try {
      console.log("🔍 Verifying contract on BaseScan...");
      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on BaseScan!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified");
      } else {
        console.log("❌ Verification failed:", error.message);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

