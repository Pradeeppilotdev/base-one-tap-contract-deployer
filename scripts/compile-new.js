const solc = require('solc');

const sources = {
  'Greeter.sol': {
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
contract Greeter {
    string public greeting;
    constructor(string memory _greeting) { greeting = _greeting; }
    function greet() public view returns (string memory) { return greeting; }
}`
  },
  'MessageBoard.sol': {
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
contract MessageBoard {
    string public message;
    address public author;
    constructor(string memory _message) { message = _message; author = msg.sender; }
}`
  },
  'NumberStore.sol': {
    content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
contract NumberStore {
    uint256 public number;
    constructor(uint256 _number) { number = _number; }
}`
  }
};

const input = {
  language: 'Solidity',
  sources,
  settings: {
    outputSelection: { '*': { '*': ['evm.bytecode.object'] } },
    optimizer: { enabled: true, runs: 200 }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  output.errors.forEach(e => console.error(e.formattedMessage));
}

for (const file of Object.keys(output.contracts || {})) {
  for (const contract of Object.keys(output.contracts[file])) {
    const bytecode = output.contracts[file][contract].evm.bytecode.object;
    console.log(`${contract}: 0x${bytecode}`);
  }
}
