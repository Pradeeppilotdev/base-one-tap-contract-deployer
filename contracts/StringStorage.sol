// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract StringStorage {
    string public value;
    
    constructor(string memory _value) {
        value = _value;
    }
}


