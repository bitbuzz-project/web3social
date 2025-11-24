// lib/contract.ts - COMPLETE V3 ABI
// Replace your current lib/contract.ts with this file

export const SOCIAL_MEDIA_CONTRACT = {
  address: '0x1E018731a31BD86f2Afa51AEbC5E7983758a283a' as `0x${string}`,
  
  abi: [
    // ============================================
    // POST FUNCTIONS
    // ============================================
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
      "inputs": [
        {"internalType": "string", "name": "_contentHash", "type": "string"},
        {"internalType": "uint256", "name": "_threadId", "type": "uint256"},
        {"internalType": "uint256", "name": "_quotedPostId", "type": "uint256"},
        {"internalType": "address[]", "name": "_mentions", "type": "address[]"}
      ],
      "name": "createThreadPost",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "uint256", "name": "_postId", "type": "uint256"},
        {"internalType": "string", "name": "_newContentHash", "type": "string"}
      ],
      "name": "editPost",
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
    
    // ============================================
    // COMMENT FUNCTIONS
    // ============================================
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
    
    // ============================================
    // BOOKMARK FUNCTIONS
    // ============================================
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
    
    // ============================================
    // PROFILE FUNCTIONS
    // ============================================
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
    
    // ============================================
    // NOTIFICATION FUNCTIONS
    // ============================================
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
    
    // ============================================
    // THREAD FUNCTIONS
    // ============================================
    {
      "inputs": [{"internalType": "uint256", "name": "_threadId", "type": "uint256"}],
      "name": "finalizeThread",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    
    // ============================================
    // VIEW FUNCTIONS - POSTS
    // ============================================
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
          {"internalType": "uint256", "name": "threadId", "type": "uint256"},
          {"internalType": "bool", "name": "isDeleted", "type": "bool"},
          {"internalType": "bool", "name": "isEdited", "type": "bool"},
          {"internalType": "uint256", "name": "lastEditTime", "type": "uint256"}
        ],
        "internalType": "struct SocialMediaV3.Post",
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
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "getEditHistory",
      "outputs": [{
        "components": [
          {"internalType": "uint256", "name": "editId", "type": "uint256"},
          {"internalType": "uint256", "name": "postId", "type": "uint256"},
          {"internalType": "string", "name": "contentHash", "type": "string"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "internalType": "struct SocialMediaV3.PostEdit[]",
        "name": "",
        "type": "tuple[]"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "uint256", "name": "_postId", "type": "uint256"},
        {"internalType": "address", "name": "_user", "type": "address"}
      ],
      "name": "canEditPost",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    
    // ============================================
    // VIEW FUNCTIONS - COMMENTS
    // ============================================
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
        "internalType": "struct SocialMediaV3.Comment[]",
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
    
    // ============================================
    // VIEW FUNCTIONS - BOOKMARKS
    // ============================================
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
    
    // ============================================
    // VIEW FUNCTIONS - PROFILE
    // ============================================
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
        "internalType": "struct SocialMediaV3.Profile",
        "name": "",
        "type": "tuple"
      }],
      "stateMutability": "view",
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
    
    // ============================================
    // VIEW FUNCTIONS - NOTIFICATIONS
    // ============================================
    {
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "getUserNotifications",
      "outputs": [{
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "address", "name": "recipient", "type": "address"},
          {"internalType": "address", "name": "actor", "type": "address"},
          {"internalType": "uint256", "name": "postId", "type": "uint256"},
          {"internalType": "enum SocialMediaV3.NotificationType", "name": "notifType", "type": "uint8"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "bool", "name": "isRead", "type": "bool"}
        ],
        "internalType": "struct SocialMediaV3.Notification[]",
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
    
    // ============================================
    // VIEW FUNCTIONS - THREADS
    // ============================================
    {
      "inputs": [{"internalType": "uint256", "name": "_threadId", "type": "uint256"}],
      "name": "getThread",
      "outputs": [{
        "components": [
          {"internalType": "uint256", "name": "threadId", "type": "uint256"},
          {"internalType": "address", "name": "author", "type": "address"},
          {"internalType": "uint256[]", "name": "postIds", "type": "uint256[]"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"}
        ],
        "internalType": "struct SocialMediaV3.Thread",
        "name": "",
        "type": "tuple"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_threadId", "type": "uint256"}],
      "name": "getThreadPosts",
      "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "getUserThreads",
      "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "isPartOfThread",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "getThreadIdForPost",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    
    // ============================================
    // VIEW FUNCTIONS - LIKES
    // ============================================
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
    
    // ============================================
    // STATE VARIABLES
    // ============================================
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
    {
      "inputs": [],
      "name": "threadCount",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "EDIT_TIME_LIMIT",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    
    // ============================================
    // EVENTS
    // ============================================
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
        {"indexed": true, "internalType": "address", "name": "author", "type": "address"},
        {"indexed": false, "internalType": "string", "name": "newContentHash", "type": "string"},
        {"indexed": false, "internalType": "uint256", "name": "editNumber", "type": "uint256"}
      ],
      "name": "PostEdited",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "threadId", "type": "uint256"},
        {"indexed": true, "internalType": "address", "name": "author", "type": "address"},
        {"indexed": false, "internalType": "uint256", "name": "firstPostId", "type": "uint256"}
      ],
      "name": "ThreadCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "threadId", "type": "uint256"},
        {"indexed": false, "internalType": "uint256", "name": "newPostId", "type": "uint256"}
      ],
      "name": "ThreadContinued",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "threadId", "type": "uint256"}
      ],
      "name": "ThreadFinalized",
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
        {"indexed": false, "internalType": "enum SocialMediaV3.NotificationType", "name": "notifType", "type": "uint8"}
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