// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ClickCounter
 * @notice A simple contract that stores and increments a click counter
 */
contract ClickCounter {
    uint256 public clickCount;
    mapping(address => uint256) public userClickCount;
    
    event Clicked(address indexed user, uint256 userCount, uint256 totalCount);
    
    /**
     * @notice Increment the click counter by 1 for the caller
     * @dev Emits a Clicked event with both user and total counts
     */
    function click() public {
        clickCount += 1;
        userClickCount[msg.sender] += 1;
        emit Clicked(msg.sender, userClickCount[msg.sender], clickCount);
    }
    
    /**
     * @notice Get the current total click count
     * @return The total number of clicks from all users
     */
    function getClickCount() public view returns (uint256) {
        return clickCount;
    }
    
    /**
     * @notice Get the click count for a specific user
     * @param user The address of the user
     * @return The number of clicks by this user
     */
    function getUserClickCount(address user) public view returns (uint256) {
        return userClickCount[user];
    }
    
    /**
     * @notice Get the click count for the caller
     * @return The number of clicks by the caller
     */
    function getMyClickCount() public view returns (uint256) {
        return userClickCount[msg.sender];
    }
}





