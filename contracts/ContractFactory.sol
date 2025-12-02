// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ContractFactory
 * @notice Factory contract for deploying contracts via CREATE2 or CREATE
 * @dev This factory allows users to deploy contracts by providing bytecode and constructor parameters
 */
contract ContractFactory {
    event ContractDeployed(address indexed deployedAddress, address indexed deployer, bytes32 indexed salt);
    
    /**
     * @notice Deploy a contract with the provided bytecode
     * @param bytecode The bytecode of the contract to deploy
     * @return deployedAddress The address of the deployed contract
     */
    function deployContract(bytes memory bytecode) external returns (address deployedAddress) {
        assembly {
            deployedAddress := create(0, add(bytecode, 0x20), mload(bytecode))
        }
        
        require(deployedAddress != address(0), "Factory: deployment failed");
        
        emit ContractDeployed(deployedAddress, msg.sender, bytes32(0));
        return deployedAddress;
    }
    
    /**
     * @notice Deploy a contract with constructor parameters
     * @param bytecode The bytecode of the contract to deploy (with constructor params encoded)
     * @return deployedAddress The address of the deployed contract
     */
    function deployContractWithParams(bytes memory bytecode) external returns (address deployedAddress) {
        assembly {
            deployedAddress := create(0, add(bytecode, 0x20), mload(bytecode))
        }
        
        require(deployedAddress != address(0), "Factory: deployment failed");
        
        emit ContractDeployed(deployedAddress, msg.sender, bytes32(0));
        return deployedAddress;
    }
    
    /**
     * @notice Predict the address where a contract will be deployed
     * @param bytecode The bytecode of the contract
     * @param salt The salt for CREATE2 (optional, can be 0 for CREATE)
     * @return predictedAddress The predicted address
     */
    function predictAddress(bytes memory bytecode, bytes32 salt) external view returns (address predictedAddress) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );
        return address(uint160(uint256(hash)));
    }
}

