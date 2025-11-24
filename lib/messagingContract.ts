export const MESSAGING_CONTRACT = {
  address: process.env.NEXT_PUBLIC_MESSAGING_CONTRACT_ADDRESS as `0x${string}`,
  abi: [
    {
      "inputs": [{"internalType": "address","name": "_otherUser","type": "address"}],
      "name": "blockUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "_user","type": "address"}],
      "name": "checkBlocked",
      "outputs": [{"internalType": "bool","name": "","type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "_messageId","type": "uint256"}],
      "name": "deleteMessage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "_otherUser","type": "address"}],
      "name": "getConversation",
      "outputs": [{
        "components": [
          {"internalType": "uint256","name": "id","type": "uint256"},
          {"internalType": "address","name": "sender","type": "address"},
          {"internalType": "address","name": "receiver","type": "address"},
          {"internalType": "string","name": "contentHash","type": "string"},
          {"internalType": "uint256","name": "timestamp","type": "uint256"},
          {"internalType": "bool","name": "isRead","type": "bool"},
          {"internalType": "bool","name": "isDeleted","type": "bool"}
        ],
        "internalType": "struct Messaging.Message[]",
        "name": "",
        "type": "tuple[]"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "user1","type": "address"},{"internalType": "address","name": "user2","type": "address"}],
      "name": "getConversationHash",
      "outputs": [{"internalType": "bytes32","name": "","type": "bytes32"}],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "name": "messages",
      "outputs": [
        {"internalType": "uint256","name": "id","type": "uint256"},
        {"internalType": "address","name": "sender","type": "address"},
        {"internalType": "address","name": "receiver","type": "address"},
        {"internalType": "string","name": "contentHash","type": "string"},
        {"internalType": "uint256","name": "timestamp","type": "uint256"},
        {"internalType": "bool","name": "isRead","type": "bool"},
        {"internalType": "bool","name": "isDeleted","type": "bool"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "_otherUser","type": "address"}],
      "name": "getConversationUnreadCount",
      "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "_otherUser","type": "address"}],
      "name": "getLastMessage",
      "outputs": [{
        "components": [
          {"internalType": "uint256","name": "id","type": "uint256"},
          {"internalType": "address","name": "sender","type": "address"},
          {"internalType": "address","name": "receiver","type": "address"},
          {"internalType": "string","name": "contentHash","type": "string"},
          {"internalType": "uint256","name": "timestamp","type": "uint256"},
          {"internalType": "bool","name": "isRead","type": "bool"},
          {"internalType": "bool","name": "isDeleted","type": "bool"}
        ],
        "internalType": "struct Messaging.Message",
        "name": "",
        "type": "tuple"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "_messageId","type": "uint256"}],
      "name": "getMessage",
      "outputs": [{
        "components": [
          {"internalType": "uint256","name": "id","type": "uint256"},
          {"internalType": "address","name": "sender","type": "address"},
          {"internalType": "address","name": "receiver","type": "address"},
          {"internalType": "string","name": "contentHash","type": "string"},
          {"internalType": "uint256","name": "timestamp","type": "uint256"},
          {"internalType": "bool","name": "isRead","type": "bool"},
          {"internalType": "bool","name": "isDeleted","type": "bool"}
        ],
        "internalType": "struct Messaging.Message",
        "name": "",
        "type": "tuple"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getUnreadCount",
      "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "_user","type": "address"}],
      "name": "getUserConversations",
      "outputs": [{
        "components": [
          {"internalType": "address","name": "user1","type": "address"},
          {"internalType": "address","name": "user2","type": "address"},
          {"internalType": "uint256[]","name": "messageIds","type": "uint256[]"},
          {"internalType": "uint256","name": "lastMessageTime","type": "uint256"}
        ],
        "internalType": "struct Messaging.Conversation[]",
        "name": "",
        "type": "tuple[]"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "_otherUser","type": "address"}],
      "name": "markConversationAsRead",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "_messageId","type": "uint256"}],
      "name": "markAsRead",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "_receiver","type": "address"},{"internalType": "string","name": "_contentHash","type": "string"}],
      "name": "sendMessage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "_user","type": "address"}],
      "name": "unblockUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "messageCount",
      "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "","type": "address"}],
      "name": "unreadCount",
      "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const
};