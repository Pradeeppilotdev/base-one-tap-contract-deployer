// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ContractFactory {
    event ContractDeployed(address indexed deployedAddress, address indexed deployer, bytes32 indexed salt);

    function deployContractWithParams(bytes memory bytecode) public returns (address deployedAddress) {
        bytes32 salt = keccak256(abi.encodePacked(bytecode, msg.sender, block.timestamp));
        assembly {
            deployedAddress := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(deployedAddress != address(0), "Factory: deployment failed");
        emit ContractDeployed(deployedAddress, msg.sender, salt);
    }
}











