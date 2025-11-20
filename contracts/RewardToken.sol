// 0x0561D5aF80cb2793B4dB25A2AF55504cF5756A3E
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardToken is ERC20, Ownable {
    constructor() ERC20("SocialReward", "SRCOIN") Ownable(msg.sender) {
        // Mint initial supply to contract owner (10 million tokens)
        _mint(msg.sender, 10_000_000 * 10**decimals());
    }

    // Allow owner to mint more tokens if needed
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}