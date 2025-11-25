// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRewardSystem {
    function rewardForPost(address creator, uint256 postId) external;
    function rewardForLike(address creator, address liker, uint256 postId, uint256 likeCount) external;
    function rewardForComment(address creator, address commenter, uint256 postId, uint256 commentId) external;
}

contract SocialMediaV3 is Ownable, ReentrancyGuard {
    
    // ============================================
    // STRUCTS
    // ============================================
    
    struct Post {
        uint256 id;
        address author;
        string contentHash;
        uint256 timestamp;
        uint256 likes;
        uint256 shares;
        uint256 quotedPostId; // 0 if not a quote
        uint256 impressions;
        uint256 threadId; // 0 if not part of thread
        bool isDeleted;
        bool isEdited;
        uint256 lastEditTime;
    }

    struct Comment {
        uint256 id;
        uint256 postId;
        address author;
        string contentHash;
        uint256 timestamp;
        bool isDeleted;
    }

    struct Profile {
        string username;
        string bio;
        string avatarHash;
        uint256 followerCount;
        uint256 followingCount;
        bool isVerified;
        address nftContract;
        uint256 nftTokenId;
    }

    struct Notification {
        uint256 id;
        address recipient;
        address actor;
        uint256 postId;
        NotificationType notifType;
        uint256 timestamp;
        bool isRead;
    }

    struct Thread {
        uint256 threadId;
        address author;
        uint256[] postIds;
        uint256 createdAt;
        bool isActive;
    }

    struct PostEdit {
        uint256 editId;
        uint256 postId;
        string contentHash;
        uint256 timestamp;
    }

    enum NotificationType {
        LIKE,
        COMMENT,
        FOLLOW,
        MENTION,
        QUOTE,
        SHARE
    }

    // ============================================
    // STATE VARIABLES
    // ============================================
    
    uint256 public postCount;
    uint256 public commentCount;
    uint256 public notificationCount;
    uint256 public threadCount;
    IRewardSystem public rewardSystem;
    
    // Post mappings
    mapping(uint256 => Post) public posts;
    mapping(uint256 => Comment) public comments;
    mapping(uint256 => uint256[]) public postComments;
    
    // Profile mappings
    mapping(address => Profile) public profiles;
    
    // Social mappings
    mapping(address => mapping(address => bool)) public isFollowing;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    
    // Bookmarks
    mapping(address => uint256[]) public userBookmarks;
    mapping(address => mapping(uint256 => bool)) public hasBookmarked;
    
    // Notifications
    mapping(address => uint256[]) public userNotifications;
    mapping(uint256 => Notification) public notifications;
    
    // Mentions
    mapping(uint256 => address[]) public postMentions;
    
    // Quote posts
    mapping(uint256 => uint256[]) public postQuotes;
    
    // Threads
    mapping(uint256 => Thread) public threads;
    mapping(uint256 => uint256) public postToThread; // postId => threadId
    mapping(address => uint256[]) public userThreads;
    
    // Edit history
    mapping(uint256 => PostEdit[]) public postEditHistory;
    mapping(uint256 => uint256) public postEditCount;
    uint256 public constant EDIT_TIME_LIMIT = 24 hours;

    // ============================================
    // EVENTS
    // ============================================
    
    event PostCreated(uint256 indexed postId, address indexed author, string contentHash, uint256 timestamp, uint256 quotedPostId);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event PostUnliked(uint256 indexed postId, address indexed unliker);
    event PostShared(uint256 indexed postId, address indexed sharer);
    event PostDeleted(uint256 indexed postId);
    event PostEdited(uint256 indexed postId, address indexed author, string newContentHash, uint256 editNumber);
    event PostBookmarked(uint256 indexed postId, address indexed user);
    event PostUnbookmarked(uint256 indexed postId, address indexed user);
    event CommentAdded(uint256 indexed commentId, uint256 indexed postId, address indexed author);
    event ProfileUpdated(address indexed user, string username, string bio);
    event Followed(address indexed follower, address indexed following);
    event Unfollowed(address indexed follower, address indexed unfollowing);
    event NotificationCreated(uint256 indexed notificationId, address indexed recipient, NotificationType notifType);
    event ImpressionRecorded(uint256 indexed postId, address indexed viewer);
    event ThreadCreated(uint256 indexed threadId, address indexed author, uint256 firstPostId);
    event ThreadContinued(uint256 indexed threadId, uint256 newPostId);
    event ThreadFinalized(uint256 indexed threadId);

    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    constructor() Ownable(msg.sender) {}

    function setRewardSystem(address _rewardSystem) external onlyOwner {
        rewardSystem = IRewardSystem(_rewardSystem);
    }

    // ============================================
    // POST FUNCTIONS
    // ============================================
    
    /**
     * @dev Create a regular post or quote post
     */
    function createPost(
        string memory _contentHash,
        uint256 _quotedPostId,
        address[] memory _mentions
    ) public {
        postCount++;
        
        // Handle quote post
        if (_quotedPostId > 0) {
            require(_quotedPostId <= postCount && !posts[_quotedPostId].isDeleted, "Invalid quoted post");
            posts[_quotedPostId].shares++;
            postQuotes[_quotedPostId].push(postCount);
            _createNotification(posts[_quotedPostId].author, msg.sender, _quotedPostId, NotificationType.QUOTE);
        }
        
        posts[postCount] = Post({
            id: postCount,
            author: msg.sender,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            likes: 0,
            shares: 0,
            quotedPostId: _quotedPostId,
            impressions: 0,
            threadId: 0,
            isDeleted: false,
            isEdited: false,
            lastEditTime: 0
        });

        // Handle mentions
        if (_mentions.length > 0) {
            postMentions[postCount] = _mentions;
            for (uint256 i = 0; i < _mentions.length; i++) {
                _createNotification(_mentions[i], msg.sender, postCount, NotificationType.MENTION);
            }
        }

        emit PostCreated(postCount, msg.sender, _contentHash, block.timestamp, _quotedPostId);
        
        // Reward
        if (address(rewardSystem) != address(0)) {
            try rewardSystem.rewardForPost(msg.sender, postCount) {} catch {}
        }
    }

    /**
     * @dev Create a thread post (new or continue existing)
     */
    function createThreadPost(
        string memory _contentHash,
        uint256 _threadId, // 0 for new thread, existing threadId to continue
        uint256 _quotedPostId,
        address[] memory _mentions
    ) public {
        postCount++;
        
        posts[postCount] = Post({
            id: postCount,
            author: msg.sender,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            likes: 0,
            shares: 0,
            quotedPostId: _quotedPostId,
            impressions: 0,
            threadId: 0,
            isDeleted: false,
            isEdited: false,
            lastEditTime: 0
        });
        
        if (_threadId == 0) {
            // Create new thread
            threadCount++;
            threads[threadCount].threadId = threadCount;
            threads[threadCount].author = msg.sender;
            threads[threadCount].postIds.push(postCount);
            threads[threadCount].createdAt = block.timestamp;
            threads[threadCount].isActive = true;
            
            posts[postCount].threadId = threadCount;
            postToThread[postCount] = threadCount;
            userThreads[msg.sender].push(threadCount);
            
            emit ThreadCreated(threadCount, msg.sender, postCount);
        } else {
            // Continue existing thread
            require(_threadId <= threadCount, "Invalid thread");
            require(threads[_threadId].author == msg.sender, "Not thread owner");
            require(threads[_threadId].isActive, "Thread finalized");
            
            threads[_threadId].postIds.push(postCount);
            posts[postCount].threadId = _threadId;
            postToThread[postCount] = _threadId;
            
            emit ThreadContinued(_threadId, postCount);
        }
        
        // Handle mentions
        if (_mentions.length > 0) {
            postMentions[postCount] = _mentions;
            for (uint256 i = 0; i < _mentions.length; i++) {
                _createNotification(_mentions[i], msg.sender, postCount, NotificationType.MENTION);
            }
        }
        
        // Reward
        if (address(rewardSystem) != address(0)) {
            try rewardSystem.rewardForPost(msg.sender, postCount) {} catch {}
        }
    }

    /**
     * @dev Edit an existing post (within 24 hours)
     */
    function editPost(uint256 _postId, string memory _newContentHash) public {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        require(!posts[_postId].isDeleted, "Post deleted");
        require(posts[_postId].author == msg.sender, "Not post author");
        
        uint256 timeSincePost = block.timestamp - posts[_postId].timestamp;
        require(timeSincePost <= EDIT_TIME_LIMIT, "Edit time expired");
        
        // Save current version to history
        postEditHistory[_postId].push(PostEdit({
            editId: postEditHistory[_postId].length,
            postId: _postId,
            contentHash: posts[_postId].contentHash,
            timestamp: block.timestamp
        }));
        
        // Update post
        posts[_postId].contentHash = _newContentHash;
        posts[_postId].lastEditTime = block.timestamp;
        posts[_postId].isEdited = true;
        postEditCount[_postId]++;
        
        emit PostEdited(_postId, msg.sender, _newContentHash, postEditCount[_postId]);
    }

    function likePost(uint256 _postId) public {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        require(!posts[_postId].isDeleted, "Post deleted");
        require(!hasLiked[_postId][msg.sender], "Already liked");

        posts[_postId].likes++;
        hasLiked[_postId][msg.sender] = true;

        if (posts[_postId].author != msg.sender) {
            _createNotification(posts[_postId].author, msg.sender, _postId, NotificationType.LIKE);
        }

        emit PostLiked(_postId, msg.sender);
        
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

    function sharePost(uint256 _postId) public {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        require(!posts[_postId].isDeleted, "Post deleted");

        posts[_postId].shares++;
        
        if (posts[_postId].author != msg.sender) {
            _createNotification(posts[_postId].author, msg.sender, _postId, NotificationType.SHARE);
        }

        emit PostShared(_postId, msg.sender);
    }

    function recordImpression(uint256 _postId) public {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        posts[_postId].impressions++;
        emit ImpressionRecorded(_postId, msg.sender);
    }

    function deletePost(uint256 _postId) public {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        require(posts[_postId].author == msg.sender, "Not post author");
        require(!posts[_postId].isDeleted, "Already deleted");

        posts[_postId].isDeleted = true;
        emit PostDeleted(_postId);
    }

    // ============================================
    // COMMENT FUNCTIONS
    // ============================================
    
    function addComment(uint256 _postId, string memory _contentHash) public {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        require(!posts[_postId].isDeleted, "Post deleted");

        commentCount++;
        comments[commentCount] = Comment({
            id: commentCount,
            postId: _postId,
            author: msg.sender,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            isDeleted: false
        });

        postComments[_postId].push(commentCount);

        if (posts[_postId].author != msg.sender) {
            _createNotification(posts[_postId].author, msg.sender, _postId, NotificationType.COMMENT);
        }

        emit CommentAdded(commentCount, _postId, msg.sender);
        
        if (address(rewardSystem) != address(0)) {
            try rewardSystem.rewardForComment(posts[_postId].author, msg.sender, _postId, commentCount) {} catch {}
        }
    }

    // ============================================
    // BOOKMARK FUNCTIONS
    // ============================================
    
    function bookmarkPost(uint256 _postId) public {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        require(!hasBookmarked[msg.sender][_postId], "Already bookmarked");

        userBookmarks[msg.sender].push(_postId);
        hasBookmarked[msg.sender][_postId] = true;

        emit PostBookmarked(_postId, msg.sender);
    }

    function unbookmarkPost(uint256 _postId) public {
        require(hasBookmarked[msg.sender][_postId], "Not bookmarked");

        hasBookmarked[msg.sender][_postId] = false;
        
        uint256[] storage bookmarks = userBookmarks[msg.sender];
        for (uint256 i = 0; i < bookmarks.length; i++) {
            if (bookmarks[i] == _postId) {
                bookmarks[i] = bookmarks[bookmarks.length - 1];
                bookmarks.pop();
                break;
            }
        }

        emit PostUnbookmarked(_postId, msg.sender);
    }

    // ============================================
    // PROFILE FUNCTIONS
    // ============================================
    
    function updateProfile(string memory _username, string memory _bio, string memory _avatarHash) public {
        profiles[msg.sender].username = _username;
        profiles[msg.sender].bio = _bio;
        profiles[msg.sender].avatarHash = _avatarHash;
        emit ProfileUpdated(msg.sender, _username, _bio);
    }

    function setNftAvatar(address _nftContract, uint256 _tokenId) public {
        profiles[msg.sender].nftContract = _nftContract;
        profiles[msg.sender].nftTokenId = _tokenId;
        profiles[msg.sender].isVerified = true;
    }

    function followUser(address _user) public {
        require(_user != msg.sender, "Cannot follow yourself");
        require(!isFollowing[msg.sender][_user], "Already following");

        isFollowing[msg.sender][_user] = true;
        profiles[_user].followerCount++;
        profiles[msg.sender].followingCount++;

        _createNotification(_user, msg.sender, 0, NotificationType.FOLLOW);
        emit Followed(msg.sender, _user);
    }

    function unfollowUser(address _user) public {
        require(isFollowing[msg.sender][_user], "Not following");

        isFollowing[msg.sender][_user] = false;
        profiles[_user].followerCount--;
        profiles[msg.sender].followingCount--;

        emit Unfollowed(msg.sender, _user);
    }

    // ============================================
    // NOTIFICATION FUNCTIONS
    // ============================================
    
    function markNotificationRead(uint256 _notificationId) public {
        require(notifications[_notificationId].recipient == msg.sender, "Not your notification");
        notifications[_notificationId].isRead = true;
    }

    function markAllNotificationsRead() public {
        uint256[] storage userNotifs = userNotifications[msg.sender];
        for (uint256 i = 0; i < userNotifs.length; i++) {
            notifications[userNotifs[i]].isRead = true;
        }
    }

    function _createNotification(address _recipient, address _actor, uint256 _postId, NotificationType _type) internal {
        if (_recipient == _actor) return;
        
        notificationCount++;
        notifications[notificationCount] = Notification({
            id: notificationCount,
            recipient: _recipient,
            actor: _actor,
            postId: _postId,
            notifType: _type,
            timestamp: block.timestamp,
            isRead: false
        });

        userNotifications[_recipient].push(notificationCount);
        emit NotificationCreated(notificationCount, _recipient, _type);
    }

    // ============================================
    // THREAD FUNCTIONS
    // ============================================
    
    function finalizeThread(uint256 _threadId) public {
        require(_threadId <= threadCount, "Invalid thread");
        require(threads[_threadId].author == msg.sender, "Not thread owner");
        require(threads[_threadId].isActive, "Already finalized");
        
        threads[_threadId].isActive = false;
        emit ThreadFinalized(_threadId);
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    function getPost(uint256 _postId) public view returns (Post memory) {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        return posts[_postId];
    }

    function getProfile(address _user) public view returns (Profile memory) {
        return profiles[_user];
    }

    function getComments(uint256 _postId) public view returns (Comment[] memory) {
        uint256[] storage commentIds = postComments[_postId];
        Comment[] memory result = new Comment[](commentIds.length);
        
        for (uint256 i = 0; i < commentIds.length; i++) {
            result[i] = comments[commentIds[i]];
        }
        
        return result;
    }

    function getCommentCount(uint256 _postId) public view returns (uint256) {
        return postComments[_postId].length;
    }

    function getUserBookmarks(address _user) public view returns (uint256[] memory) {
        return userBookmarks[_user];
    }

    function getUserNotifications(address _user) public view returns (Notification[] memory) {
        uint256[] storage notifIds = userNotifications[_user];
        Notification[] memory result = new Notification[](notifIds.length);
        
        for (uint256 i = 0; i < notifIds.length; i++) {
            result[i] = notifications[notifIds[i]];
        }
        
        return result;
    }

    function getUnreadNotificationCount(address _user) public view returns (uint256) {
        uint256[] storage notifIds = userNotifications[_user];
        uint256 count = 0;
        
        for (uint256 i = 0; i < notifIds.length; i++) {
            if (!notifications[notifIds[i]].isRead) {
                count++;
            }
        }
        
        return count;
    }

    function getQuotePosts(uint256 _postId) public view returns (uint256[] memory) {
        return postQuotes[_postId];
    }

    function getThread(uint256 _threadId) public view returns (Thread memory) {
        return threads[_threadId];
    }

    function getThreadPosts(uint256 _threadId) public view returns (uint256[] memory) {
        return threads[_threadId].postIds;
    }

    function getUserThreads(address _user) public view returns (uint256[] memory) {
        return userThreads[_user];
    }

    function getEditHistory(uint256 _postId) public view returns (PostEdit[] memory) {
        return postEditHistory[_postId];
    }

    function canEditPost(uint256 _postId, address _user) public view returns (bool) {
        if (_postId == 0 || _postId > postCount) return false;
        if (posts[_postId].isDeleted) return false;
        if (posts[_postId].author != _user) return false;
        
        uint256 timeSincePost = block.timestamp - posts[_postId].timestamp;
        return timeSincePost <= EDIT_TIME_LIMIT;
    }

    function checkFollowing(address _follower, address _following) public view returns (bool) {
        return isFollowing[_follower][_following];
    }

    function isPartOfThread(uint256 _postId) public view returns (bool) {
        return postToThread[_postId] != 0;
    }

    function getThreadIdForPost(uint256 _postId) public view returns (uint256) {
        return postToThread[_postId];
    }
}
