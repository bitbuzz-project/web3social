// 0x24b825A215D1056d49C9f8C995610f2500485e64
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RewardSystem is Ownable, ReentrancyGuard {
    IERC20 public rewardToken;
    
    // Reward amounts (in token smallest unit)
    uint256 public likeReward = 1 * 10**18;      // 1 token per like
    uint256 public commentReward = 5 * 10**18;   // 5 tokens per comment
    uint256 public postReward = 10 * 10**18;     // 10 tokens per post

    // Track user rewards
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public totalEarned;
    
    // Track if action already rewarded
    mapping(bytes32 => bool) public actionClaimed;

    event RewardEarned(address indexed user, uint256 amount, string actionType);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRatesUpdated(uint256 likeReward, uint256 commentReward, uint256 postReward);

    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
    }

    // Post creator gets reward
    function rewardForPost(address creator, uint256 postId) external onlyOwner {
        bytes32 actionId = keccak256(abi.encodePacked("post", postId));
        require(!actionClaimed[actionId], "Already rewarded");
        
        actionClaimed[actionId] = true;
        pendingRewards[creator] += postReward;
        totalEarned[creator] += postReward;
        
        emit RewardEarned(creator, postReward, "post");
    }

    // Post creator gets reward when someone likes
    function rewardForLike(address creator, uint256 postId, uint256 likeCount) external onlyOwner {
        bytes32 actionId = keccak256(abi.encodePacked("like", postId, likeCount));
        require(!actionClaimed[actionId], "Already rewarded");
        
        actionClaimed[actionId] = true;
        pendingRewards[creator] += likeReward;
        totalEarned[creator] += likeReward;
        
        emit RewardEarned(creator, likeReward, "like");
    }

    // Post creator gets reward when someone comments
    function rewardForComment(address creator, uint256 postId, uint256 commentId) external onlyOwner {
        bytes32 actionId = keccak256(abi.encodePacked("comment", postId, commentId));
        require(!actionClaimed[actionId], "Already rewarded");
        
        actionClaimed[actionId] = true;
        pendingRewards[creator] += commentReward;
        totalEarned[creator] += commentReward;
        
        emit RewardEarned(creator, commentReward, "comment");
    }

    // User claims their rewards
    function claimRewards() external nonReentrant {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        require(rewardToken.balanceOf(address(this)) >= amount, "Insufficient rewards in contract");

        pendingRewards[msg.sender] = 0;
        require(rewardToken.transfer(msg.sender, amount), "Transfer failed");

        emit RewardClaimed(msg.sender, amount);
    }

    // Admin: Update reward rates
    function updateRewardRates(
        uint256 _likeReward,
        uint256 _commentReward,
        uint256 _postReward
    ) external onlyOwner {
        likeReward = _likeReward;
        commentReward = _commentReward;
        postReward = _postReward;
        
        emit RewardRatesUpdated(_likeReward, _commentReward, _postReward);
    }

    // Admin: Fund the reward pool
    function fundRewardPool(uint256 amount) external onlyOwner {
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }

    // Admin: Emergency withdraw
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = rewardToken.balanceOf(address(this));
        require(rewardToken.transfer(owner(), balance), "Transfer failed");
    }

    // View functions
    function getPendingRewards(address user) external view returns (uint256) {
        return pendingRewards[user];
    }

    function getTotalEarned(address user) external view returns (uint256) {
        return totalEarned[user];
    }

    function getRewardPoolBalance() external view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }
}