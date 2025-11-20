// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRewardSystem {
    function rewardForPost(address creator, uint256 postId) external;
    function rewardForLike(address creator, address liker, uint256 postId, uint256 likeCount) external;
}



contract SocialMedia is Ownable, ReentrancyGuard {
    struct Post {
        uint256 id;
        address author;
        string contentHash;
        uint256 timestamp;
        uint256 likes;
        bool isDeleted;
    }

    struct Profile {
        string username;
        string bio;
        string avatarHash;
        uint256 followerCount;
        uint256 followingCount;
    }

    uint256 public postCount;
    IRewardSystem public rewardSystem;
    
    mapping(uint256 => Post) public posts;
    mapping(address => Profile) public profiles;
    mapping(address => mapping(address => bool)) public isFollowing;
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    event PostCreated(uint256 indexed postId, address indexed author, string contentHash, uint256 timestamp);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event PostUnliked(uint256 indexed postId, address indexed unliker);
    event PostDeleted(uint256 indexed postId);
    event ProfileUpdated(address indexed user, string username, string bio);
    event Followed(address indexed follower, address indexed following);
    event Unfollowed(address indexed follower, address indexed unfollowing);

    constructor() Ownable(msg.sender) {}

    function setRewardSystem(address _rewardSystem) external onlyOwner {
        rewardSystem = IRewardSystem(_rewardSystem);
    }

    function createPost(string memory _contentHash) public {
        postCount++;
        posts[postCount] = Post({
            id: postCount,
            author: msg.sender,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            likes: 0,
            isDeleted: false
        });

        emit PostCreated(postCount, msg.sender, _contentHash, block.timestamp);
        
        // Reward for creating post
        if (address(rewardSystem) != address(0)) {
            try rewardSystem.rewardForPost(msg.sender, postCount) {} catch {}
        }
    }
// Update likePost function
function likePost(uint256 _postId) public {
    require(_postId > 0 && _postId <= postCount, "Invalid post ID");
    require(!posts[_postId].isDeleted, "Post deleted");
    require(!hasLiked[_postId][msg.sender], "Already liked");

    posts[_postId].likes++;
    hasLiked[_postId][msg.sender] = true;

    emit PostLiked(_postId, msg.sender);
    
    // Reward post creator with weighted reward based on liker's balance
    if (address(rewardSystem) != address(0)) {
        try rewardSystem.rewardForLike(posts[_postId].author, msg.sender, _postId, posts[_postId].likes) {} catch {}
    }
}

    function unlikePost(uint256 _postId) public {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        require(hasLiked[_postId][msg.sender], "Not liked yet");

        posts[_postId].likes--;
        hasLiked[_postId][msg.sender] = false;

        emit PostUnliked(_postId, msg.sender);
    }

    function deletePost(uint256 _postId) public {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        require(posts[_postId].author == msg.sender, "Not post author");
        require(!posts[_postId].isDeleted, "Already deleted");

        posts[_postId].isDeleted = true;

        emit PostDeleted(_postId);
    }

    function updateProfile(string memory _username, string memory _bio, string memory _avatarHash) public {
        profiles[msg.sender].username = _username;
        profiles[msg.sender].bio = _bio;
        profiles[msg.sender].avatarHash = _avatarHash;

        emit ProfileUpdated(msg.sender, _username, _bio);
    }

    function followUser(address _user) public {
        require(_user != msg.sender, "Cannot follow yourself");
        require(!isFollowing[msg.sender][_user], "Already following");

        isFollowing[msg.sender][_user] = true;
        profiles[_user].followerCount++;
        profiles[msg.sender].followingCount++;

        emit Followed(msg.sender, _user);
    }

    function unfollowUser(address _user) public {
        require(isFollowing[msg.sender][_user], "Not following");

        isFollowing[msg.sender][_user] = false;
        profiles[_user].followerCount--;
        profiles[msg.sender].followingCount--;

        emit Unfollowed(msg.sender, _user);
    }

    function getPost(uint256 _postId) public view returns (Post memory) {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        return posts[_postId];
    }

    function getProfile(address _user) public view returns (Profile memory) {
        return profiles[_user];
    }

    function checkFollowing(address _follower, address _following) public view returns (bool) {
        return isFollowing[_follower][_following];
    }
}