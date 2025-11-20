// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RewardSystem is Ownable, ReentrancyGuard {
    IERC20 public rewardToken;
    address public socialMediaContract;
    
    // Base reward amounts
    uint256 public basePostReward = 10 * 10**18;        // 10 tokens per post
    uint256 public baseLikeReward = 1 * 10**18;         // 1 token per like (base)
    uint256 public baseCommentReward = 5 * 10**18;      // 5 tokens per comment (base)

    // Token holder tiers for weighted rewards
    struct RewardTier {
        uint256 minBalance;
        uint256 multiplier; // in percentage (100 = 1x, 200 = 2x, etc.)
    }

    RewardTier[] public rewardTiers;

    // Track user rewards
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public totalEarned;
    
    // Track if action already rewarded
    mapping(bytes32 => bool) public actionClaimed;

    event RewardEarned(address indexed user, uint256 amount, string actionType, uint256 multiplier);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRatesUpdated(uint256 basePostReward, uint256 baseLikeReward, uint256 baseCommentReward);
    event TierAdded(uint256 minBalance, uint256 multiplier);
    event SocialMediaContractSet(address indexed socialMedia);

    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
        
        // Initialize default tiers
        rewardTiers.push(RewardTier(0, 100));              // 0+ tokens: 1x (base)
        rewardTiers.push(RewardTier(1000 * 10**18, 150));  // 1,000+ tokens: 1.5x
        rewardTiers.push(RewardTier(5000 * 10**18, 200));  // 5,000+ tokens: 2x
        rewardTiers.push(RewardTier(10000 * 10**18, 300)); // 10,000+ tokens: 3x
        rewardTiers.push(RewardTier(50000 * 10**18, 500)); // 50,000+ tokens: 5x
    }

    // Set the social media contract address
    function setSocialMediaContract(address _socialMedia) external onlyOwner {
        socialMediaContract = _socialMedia;
        emit SocialMediaContractSet(_socialMedia);
    }

    modifier onlySocialMedia() {
        require(msg.sender == socialMediaContract, "Only social media contract");
        _;
    }

    // Get user's reward multiplier based on token balance
    function getUserMultiplier(address user) public view returns (uint256) {
        uint256 balance = rewardToken.balanceOf(user);
        uint256 multiplier = 100; // Default 1x
        
        // Find the highest tier the user qualifies for
        for (uint256 i = 0; i < rewardTiers.length; i++) {
            if (balance >= rewardTiers[i].minBalance) {
                multiplier = rewardTiers[i].multiplier;
            }
        }
        
        return multiplier;
    }

    // Calculate weighted reward based on actor's token balance
    function calculateWeightedReward(uint256 baseReward, address actor) internal view returns (uint256) {
        uint256 multiplier = getUserMultiplier(actor);
        return (baseReward * multiplier) / 100;
    }

    // Post creator gets base reward
    function rewardForPost(address creator, uint256 postId) external onlySocialMedia {
        bytes32 actionId = keccak256(abi.encodePacked("post", postId));
        require(!actionClaimed[actionId], "Already rewarded");
        
        actionClaimed[actionId] = true;
        pendingRewards[creator] += basePostReward;
        totalEarned[creator] += basePostReward;
        
        emit RewardEarned(creator, basePostReward, "post", 100);
    }

    // Post creator gets weighted reward when someone likes (based on liker's balance)
    function rewardForLike(address creator, address liker, uint256 postId, uint256 likeCount) external onlySocialMedia {
        bytes32 actionId = keccak256(abi.encodePacked("like", postId, likeCount));
        require(!actionClaimed[actionId], "Already rewarded");
        
        actionClaimed[actionId] = true;
        
        // Calculate reward based on liker's token balance
        uint256 reward = calculateWeightedReward(baseLikeReward, liker);
        
        pendingRewards[creator] += reward;
        totalEarned[creator] += reward;
        
        uint256 multiplier = getUserMultiplier(liker);
        emit RewardEarned(creator, reward, "like", multiplier);
    }

    // Post creator gets weighted reward when someone comments (based on commenter's balance)
    function rewardForComment(address creator, address commenter, uint256 postId, uint256 commentId) external onlySocialMedia {
        bytes32 actionId = keccak256(abi.encodePacked("comment", postId, commentId));
        require(!actionClaimed[actionId], "Already rewarded");
        
        actionClaimed[actionId] = true;
        
        // Calculate reward based on commenter's token balance
        uint256 reward = calculateWeightedReward(baseCommentReward, commenter);
        
        pendingRewards[creator] += reward;
        totalEarned[creator] += reward;
        
        uint256 multiplier = getUserMultiplier(commenter);
        emit RewardEarned(creator, reward, "comment", multiplier);
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

    // Admin: Update base reward rates
    function updateBaseRewardRates(
        uint256 _basePostReward,
        uint256 _baseLikeReward,
        uint256 _baseCommentReward
    ) external onlyOwner {
        basePostReward = _basePostReward;
        baseLikeReward = _baseLikeReward;
        baseCommentReward = _baseCommentReward;
        
        emit RewardRatesUpdated(_basePostReward, _baseLikeReward, _baseCommentReward);
    }

    // Admin: Add new reward tier
    function addRewardTier(uint256 minBalance, uint256 multiplier) external onlyOwner {
        rewardTiers.push(RewardTier(minBalance, multiplier));
        emit TierAdded(minBalance, multiplier);
    }

    // Admin: Update existing tier
    function updateRewardTier(uint256 index, uint256 minBalance, uint256 multiplier) external onlyOwner {
        require(index < rewardTiers.length, "Invalid index");
        rewardTiers[index] = RewardTier(minBalance, multiplier);
    }

    // Admin: Remove last tier
    function removeLastTier() external onlyOwner {
        require(rewardTiers.length > 1, "Cannot remove all tiers");
        rewardTiers.pop();
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

    function getTierCount() external view returns (uint256) {
        return rewardTiers.length;
    }

    function getTier(uint256 index) external view returns (uint256 minBalance, uint256 multiplier) {
        require(index < rewardTiers.length, "Invalid index");
        RewardTier memory tier = rewardTiers[index];
        return (tier.minBalance, tier.multiplier);
    }

    function getBaseRewards() external view returns (uint256 post, uint256 like, uint256 comment) {
        return (basePostReward, baseLikeReward, baseCommentReward);
    }
}