import hre from "hardhat";

const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy StringStorage with initial value
  const StringStorage = await ethers.getContractFactory("StringStorage");
  const stringStorage = await StringStorage.deploy("Hello Base Sepolia!");
  await stringStorage.waitForDeployment();
  const stringStorageAddress = await stringStorage.getAddress();
  console.log("StringStorage deployed to:", stringStorageAddress);
  console.log("StringStorage bytecode length:", (await ethers.provider.getCode(stringStorageAddress)).length);

  // Deploy Calculator with initial value
  const Calculator = await ethers.getContractFactory("Calculator");
  const calculator = await Calculator.deploy(100);
  await calculator.waitForDeployment();
  const calculatorAddress = await calculator.getAddress();
  console.log("Calculator deployed to:", calculatorAddress);
  console.log("Calculator bytecode length:", (await ethers.provider.getCode(calculatorAddress)).length);

  // Deploy Counter (no constructor params)
  const Counter = await ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  const counterAddress = await counter.getAddress();
  console.log("Counter deployed to:", counterAddress);
  console.log("Counter bytecode length:", (await ethers.provider.getCode(counterAddress)).length);

  // Get deployment bytecode (bytecode + constructor args)
  const stringStorageDeploymentTx = await stringStorage.deploymentTransaction();
  const calculatorDeploymentTx = await calculator.deploymentTransaction();
  const counterDeploymentTx = await counter.deploymentTransaction();

  console.log("\n=== DEPLOYMENT BYTECODE (for frontend) ===");
  console.log("\nStringStorage deployment data:");
  console.log(stringStorageDeploymentTx?.data);
  
  console.log("\nCalculator deployment data:");
  console.log(calculatorDeploymentTx?.data);
  
  console.log("\nCounter deployment data:");
  console.log(counterDeploymentTx?.data);

  // Get contract bytecode only (without constructor)
  const StringStorageArtifact = await ethers.getContractFactory("StringStorage");
  const CalculatorArtifact = await ethers.getContractFactory("Calculator");
  const CounterArtifact = await ethers.getContractFactory("Counter");

  console.log("\n=== CONTRACT BYTECODE ONLY (for frontend) ===");
  console.log("\nStringStorage bytecode:");
  console.log(StringStorageArtifact.bytecode);
  
  console.log("\nCalculator bytecode:");
  console.log(CalculatorArtifact.bytecode);
  
  console.log("\nCounter bytecode:");
  console.log(CounterArtifact.bytecode);

  console.log("\n=== CONTRACT ADDRESSES ===");
  console.log("StringStorage:", stringStorageAddress);
  console.log("Calculator:", calculatorAddress);
  console.log("Counter:", counterAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


