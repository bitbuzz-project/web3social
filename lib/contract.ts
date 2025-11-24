// Update this file: lib/contract.ts
// Keep the name as SOCIAL_MEDIA_CONTRACT (don't change to V2)

export const SOCIAL_MEDIA_CONTRACT = {
  // ⚠️ REPLACE THIS ADDRESS with your deployed SocialMediaV2.sol address
  address: '0x1E018731a31BD86f2Afa51AEbC5E7983758a283a' as `0x${string}`,
  
  abi: [
    // Posts - Enhanced
    {
      "inputs": [
        {"internalType": "string", "name": "_contentHash", "type": "string"},
        {"internalType": "uint256", "name": "_quotedPostId", "type": "uint256"},
        {"internalType": "address[]", "name": "_mentions", "type": "address[]"}
      ],
      "name": "createPost",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "likePost",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "unlikePost",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "sharePost",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "deletePost",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "recordImpression",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "getPost",
      "outputs": [{
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "address", "name": "author", "type": "address"},
          {"internalType": "string", "name": "contentHash", "type": "string"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "uint256", "name": "likes", "type": "uint256"},
          {"internalType": "uint256", "name": "shares", "type": "uint256"},
          {"internalType": "uint256", "name": "quotedPostId", "type": "uint256"},
          {"internalType": "uint256", "name": "impressions", "type": "uint256"},
          {"internalType": "bool", "name": "isDeleted", "type": "bool"}
        ],
        "internalType": "struct SocialMediaV2.Post",
        "name": "",
        "type": "tuple"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "getQuotePosts",
      "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    
    // Comments
    {
      "inputs": [
        {"internalType": "uint256", "name": "_postId", "type": "uint256"},
        {"internalType": "string", "name": "_contentHash", "type": "string"}
      ],
      "name": "addComment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "getComments",
      "outputs": [{
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "uint256", "name": "postId", "type": "uint256"},
          {"internalType": "address", "name": "author", "type": "address"},
          {"internalType": "string", "name": "contentHash", "type": "string"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "bool", "name": "isDeleted", "type": "bool"}
        ],
        "internalType": "struct SocialMediaV2.Comment[]",
        "name": "",
        "type": "tuple[]"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "getCommentCount",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    
    // Bookmarks - NEW
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "bookmarkPost",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "unbookmarkPost",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "getUserBookmarks",
      "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "", "type": "address"},
        {"internalType": "uint256", "name": "", "type": "uint256"}
      ],
      "name": "hasBookmarked",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    
    // Notifications - NEW
    {
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "getUserNotifications",
      "outputs": [{
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "address", "name": "recipient", "type": "address"},
          {"internalType": "address", "name": "actor", "type": "address"},
          {"internalType": "uint256", "name": "postId", "type": "uint256"},
          {"internalType": "enum SocialMediaV2.NotificationType", "name": "notifType", "type": "uint8"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "bool", "name": "isRead", "type": "bool"}
        ],
        "internalType": "struct SocialMediaV2.Notification[]",
        "name": "",
        "type": "tuple[]"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "getUnreadNotificationCount",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_notificationId", "type": "uint256"}],
      "name": "markNotificationRead",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "markAllNotificationsRead",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    
    // Profile & Follow
    {
      "inputs": [
        {"internalType": "string", "name": "_username", "type": "string"},
        {"internalType": "string", "name": "_bio", "type": "string"},
        {"internalType": "string", "name": "_avatarHash", "type": "string"}
      ],
      "name": "updateProfile",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "_nftContract", "type": "address"},
        {"internalType": "uint256", "name": "_tokenId", "type": "uint256"}
      ],
      "name": "setNftAvatar",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "getProfile",
      "outputs": [{
        "components": [
          {"internalType": "string", "name": "username", "type": "string"},
          {"internalType": "string", "name": "bio", "type": "string"},
          {"internalType": "string", "name": "avatarHash", "type": "string"},
          {"internalType": "uint256", "name": "followerCount", "type": "uint256"},
          {"internalType": "uint256", "name": "followingCount", "type": "uint256"},
          {"internalType": "bool", "name": "isVerified", "type": "bool"},
          {"internalType": "address", "name": "nftContract", "type": "address"},
          {"internalType": "uint256", "name": "nftTokenId", "type": "uint256"}
        ],
        "internalType": "struct SocialMediaV2.Profile",
        "name": "",
        "type": "tuple"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "followUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "unfollowUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "_follower", "type": "address"},
        {"internalType": "address", "name": "_following", "type": "address"}
      ],
      "name": "checkFollowing",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "uint256", "name": "", "type": "uint256"},
        {"internalType": "address", "name": "", "type": "address"}
      ],
      "name": "hasLiked",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    
    // State variables
    {
      "inputs": [],
      "name": "postCount",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "commentCount",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "notificationCount",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    
    // Events
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256"},
        {"indexed": true, "internalType": "address", "name": "author", "type": "address"},
        {"indexed": false, "internalType": "string", "name": "contentHash", "type": "string"},
        {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
        {"indexed": false, "internalType": "uint256", "name": "quotedPostId", "type": "uint256"}
      ],
      "name": "PostCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256"},
        {"indexed": true, "internalType": "address", "name": "liker", "type": "address"}
      ],
      "name": "PostLiked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256"},
        {"indexed": true, "internalType": "address", "name": "unliker", "type": "address"}
      ],
      "name": "PostUnliked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256"},
        {"indexed": true, "internalType": "address", "name": "sharer", "type": "address"}
      ],
      "name": "PostShared",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256"}
      ],
      "name": "PostDeleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256"},
        {"indexed": true, "internalType": "address", "name": "user", "type": "address"}
      ],
      "name": "PostBookmarked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256"},
        {"indexed": true, "internalType": "address", "name": "user", "type": "address"}
      ],
      "name": "PostUnbookmarked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "commentId", "type": "uint256"},
        {"indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256"},
        {"indexed": true, "internalType": "address", "name": "author", "type": "address"}
      ],
      "name": "CommentAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
        {"indexed": false, "internalType": "string", "name": "username", "type": "string"},
        {"indexed": false, "internalType": "string", "name": "bio", "type": "string"}
      ],
      "name": "ProfileUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "address", "name": "follower", "type": "address"},
        {"indexed": true, "internalType": "address", "name": "following", "type": "address"}
      ],
      "name": "Followed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "address", "name": "follower", "type": "address"},
        {"indexed": true, "internalType": "address", "name": "unfollowing", "type": "address"}
      ],
      "name": "Unfollowed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "notificationId", "type": "uint256"},
        {"indexed": true, "internalType": "address", "name": "recipient", "type": "address"},
        {"indexed": false, "internalType": "enum SocialMediaV2.NotificationType", "name": "notifType", "type": "uint8"}
      ],
      "name": "NotificationCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256"},
        {"indexed": true, "internalType": "address", "name": "viewer", "type": "address"}
      ],
      "name": "ImpressionRecorded",
      "type": "event"
    }
  ] as const
};