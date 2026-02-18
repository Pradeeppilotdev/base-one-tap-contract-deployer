// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MessageBoard {
    string public message;
    address public author;
    
    constructor(string memory _message) {
        message = _message;
        author = msg.sender;
    }
}
