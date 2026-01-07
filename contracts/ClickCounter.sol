// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ClickCounter
 * @notice A simple contract that stores and increments a click counter
 */
contract ClickCounter {
    uint256 public clickCount;
    
    event Clicked(address indexed user, uint256 newCount);
    
    /**
     * @notice Increment the click counter by 1
     * @dev Emits a Clicked event with the new count
     */
    function click() public {
        clickCount += 1;
        emit Clicked(msg.sender, clickCount);
    }
    
    /**
     * @notice Get the current click count
     * @return The current number of clicks
     */
    function getClickCount() public view returns (uint256) {
        return clickCount;
    }
}





