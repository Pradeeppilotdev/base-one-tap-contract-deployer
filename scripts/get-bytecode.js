const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Getting contract bytecode and ABIs...\n");

  // Get artifacts
  const StringStorageArtifact = await hre.ethers.getContractFactory("StringStorage");
  const CalculatorArtifact = await hre.ethers.getContractFactory("Calculator");
  const CounterArtifact = await hre.ethers.getContractFactory("Counter");

  // Read ABIs from artifacts
  const stringStorageAbi = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/StringStorage.sol/StringStorage.json"),
      "utf8"
    )
  ).abi;

  const calculatorAbi = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/Calculator.sol/Calculator.json"),
      "utf8"
    )
  ).abi;

  const counterAbi = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/Counter.sol/Counter.json"),
      "utf8"
    )
  ).abi;

  const contracts = {
    string: {
      name: "String Storage",
      description: "Store and retrieve a string value",
      bytecode: StringStorageArtifact.bytecode,
      abi: stringStorageAbi,
      hasInput: true,
      inputType: "string",
      inputLabel: "Initial String Value",
      inputPlaceholder: "Enter a string to store in the contract",
    },
    calculator: {
      name: "Calculator",
      description: "Store a number and perform arithmetic operations",
      bytecode: CalculatorArtifact.bytecode,
      abi: calculatorAbi,
      hasInput: true,
      inputType: "number",
      inputLabel: "Initial Number",
      inputPlaceholder: "Enter a number to initialize (e.g., 100)",
    },
    counter: {
      name: "Simple Counter",
      description: "A counter that starts at zero and can be incremented",
      bytecode: CounterArtifact.bytecode,
      abi: counterAbi,
      hasInput: false,
    },
  };

  // Write to JSON file
  const outputPath = path.join(__dirname, "../contracts-config.json");
  fs.writeFileSync(outputPath, JSON.stringify(contracts, null, 2));

  console.log("✅ Contract configurations written to:", outputPath);
  console.log("\nContract bytecodes:");
  console.log("StringStorage:", contracts.string.bytecode.substring(0, 50) + "...");
  console.log("Calculator:", contracts.calculator.bytecode.substring(0, 50) + "...");
  console.log("Counter:", contracts.counter.bytecode.substring(0, 50) + "...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

