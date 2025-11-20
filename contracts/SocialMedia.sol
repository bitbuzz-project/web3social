// Add this interface at the top
// 0x4c37625849C4D61dD3E87662fDD4945741B25E22
interface IRewardSystem {
    function rewardForPost(address creator, uint256 postId) external;
    function rewardForLike(address creator, uint256 postId, uint256 likeCount) external;
}

// Add this state variable
IRewardSystem public rewardSystem;

// Add this function
function setRewardSystem(address _rewardSystem) public onlyOwner {
    rewardSystem = IRewardSystem(_rewardSystem);
}

// Update createPost function
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
        rewardSystem.rewardForPost(msg.sender, postCount);
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
    
    // Reward post creator for getting a like
    if (address(rewardSystem) != address(0)) {
        rewardSystem.rewardForLike(posts[_postId].author, _postId, posts[_postId].likes);
    }
}