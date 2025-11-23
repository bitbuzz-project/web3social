export const SOCIAL_MEDIA_CONTRACT = {
  address: '0x2A227198791dA6cF0a26F28b5ea4F7b684537cd4' as `0x${string}`,
  abi: [
    // Add these to the abi array in SOCIAL_MEDIA_CONTRACT
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
    "internalType": "struct SocialMedia.Comment[]",
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
        {"indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256"},
        {"indexed": true, "internalType": "address", "name": "author", "type": "address"},
        {"indexed": false, "internalType": "string", "name": "contentHash", "type": "string"},
        {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
      ],
      "name": "PostCreated",
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
        {"indexed": true, "internalType": "address", "name": "unfollowing", "type": "address"}
      ],
      "name": "Unfollowed",
      "type": "event"
    },
    {
      "inputs": [{"internalType": "address", "name": "_follower", "type": "address"}, {"internalType": "address", "name": "_following", "type": "address"}],
      "name": "checkFollowing",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "string", "name": "_contentHash", "type": "string"}],
      "name": "createPost",
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
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "followUser",
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
          {"internalType": "bool", "name": "isDeleted", "type": "bool"}
        ],
        "internalType": "struct SocialMedia.Post",
        "name": "",
        "type": "tuple"
      }],
      "stateMutability": "view",
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
          {"internalType": "uint256", "name": "followingCount", "type": "uint256"}
        ],
        "internalType": "struct SocialMedia.Profile",
        "name": "",
        "type": "tuple"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}, {"internalType": "address", "name": "", "type": "address"}],
      "name": "hasLiked",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "", "type": "address"}, {"internalType": "address", "name": "", "type": "address"}],
      "name": "isFollowing",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
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
      "inputs": [],
      "name": "postCount",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "name": "posts",
      "outputs": [
        {"internalType": "uint256", "name": "id", "type": "uint256"},
        {"internalType": "address", "name": "author", "type": "address"},
        {"internalType": "string", "name": "contentHash", "type": "string"},
        {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
        {"internalType": "uint256", "name": "likes", "type": "uint256"},
        {"internalType": "bool", "name": "isDeleted", "type": "bool"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "", "type": "address"}],
      "name": "profiles",
      "outputs": [
        {"internalType": "string", "name": "username", "type": "string"},
        {"internalType": "string", "name": "bio", "type": "string"},
        {"internalType": "string", "name": "avatarHash", "type": "string"},
        {"internalType": "uint256", "name": "followerCount", "type": "uint256"},
        {"internalType": "uint256", "name": "followingCount", "type": "uint256"}
      ],
      "stateMutability": "view",
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
      "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
      "name": "unlikePost",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
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
    }
  ] as const
};