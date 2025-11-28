// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Calculator {
    uint256 public result;
    
    constructor(uint256 _initial) {
        result = _initial;
    }
    
    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }
    
    function subtract(uint256 a, uint256 b) public pure returns (uint256) {
        return a - b;
    }
    
    function multiply(uint256 a, uint256 b) public pure returns (uint256) {
        return a * b;
    }
}


