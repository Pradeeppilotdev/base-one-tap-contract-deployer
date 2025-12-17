import hre from "hardhat";

const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying ContractFactory with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());

  // Deploy ContractFactory
  const ContractFactory = await ethers.getContractFactory("ContractFactory");
  const factory = await ContractFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  
  console.log("\n=== FACTORY CONTRACT DEPLOYED ===");
  console.log("Factory Address:", factoryAddress);
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("\n=== UPDATE IN CONTRACTDEPLOYER.TSX ===");
  console.log(`Update FACTORY_CONTRACT_ADDRESSES.${network.chainId === 8453n ? 'mainnet' : 'testnet'} to: ${factoryAddress}`);
  
  // Verify deployment
  const code = await ethers.provider.getCode(factoryAddress);
  if (code === "0x") {
    console.error("ERROR: Contract deployment failed - no code at address");
    process.exit(1);
  }
  console.log("\n✓ Contract verified - code exists at address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

