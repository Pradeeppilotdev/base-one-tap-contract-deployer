// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Greeter {
    string public greeting;
    
    constructor(string memory _greeting) {
        greeting = _greeting;
    }
    
    function greet() public view returns (string memory) {
        return greeting;
    }
}
