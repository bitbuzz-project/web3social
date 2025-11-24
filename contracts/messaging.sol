// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Messaging is Ownable, ReentrancyGuard {
    struct Message {
        uint256 id;
        address sender;
        address receiver;
        string contentHash; // IPFS hash
        uint256 timestamp;
        bool isRead;
        bool isDeleted;
    }

    struct Conversation {
        address user1;
        address user2;
        uint256[] messageIds;
        uint256 lastMessageTime;
    }

    uint256 public messageCount;
    uint256 public conversationCount;

    // Message storage
    mapping(uint256 => Message) public messages;
    
    // Conversation storage: hash of (user1, user2) => conversation
    mapping(bytes32 => Conversation) public conversations;
    
    // User's conversations: user => conversationHashes[]
    mapping(address => bytes32[]) public userConversations;
    
    // User's inbox: receiver => messageIds[]
    mapping(address => uint256[]) public userInbox;
    
    // User's sent messages: sender => messageIds[]
    mapping(address => uint256[]) public userSentMessages;
    
    // Unread message count
    mapping(address => uint256) public unreadCount;
    
    // Blocked users: user => blockedUser => isBlocked
    mapping(address => mapping(address => bool)) public isBlocked;

    event MessageSent(uint256 indexed messageId, address indexed sender, address indexed receiver, uint256 timestamp);
    event MessageRead(uint256 indexed messageId, address indexed reader);
    event MessageDeleted(uint256 indexed messageId, address indexed deleter);
    event UserBlocked(address indexed blocker, address indexed blocked);
    event UserUnblocked(address indexed unblocker, address indexed unblocked);

    constructor() Ownable(msg.sender) {}

    // Get conversation hash (sorted to ensure consistency)
    function getConversationHash(address user1, address user2) public pure returns (bytes32) {
        if (user1 < user2) {
            return keccak256(abi.encodePacked(user1, user2));
        } else {
            return keccak256(abi.encodePacked(user2, user1));
        }
    }

    // Send a message
    function sendMessage(address _receiver, string memory _contentHash) public nonReentrant {
        require(_receiver != address(0), "Invalid receiver");
        require(_receiver != msg.sender, "Cannot message yourself");
        require(!isBlocked[_receiver][msg.sender], "You are blocked by this user");
        require(!isBlocked[msg.sender][_receiver], "You blocked this user");

        messageCount++;
        
        messages[messageCount] = Message({
            id: messageCount,
            sender: msg.sender,
            receiver: _receiver,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            isRead: false,
            isDeleted: false
        });

        // Update inbox and sent messages
        userInbox[_receiver].push(messageCount);
        userSentMessages[msg.sender].push(messageCount);
        unreadCount[_receiver]++;

        // Update or create conversation
        bytes32 convHash = getConversationHash(msg.sender, _receiver);
        
        if (conversations[convHash].user1 == address(0)) {
            // New conversation
            conversationCount++;
            conversations[convHash].user1 = msg.sender < _receiver ? msg.sender : _receiver;
            conversations[convHash].user2 = msg.sender < _receiver ? _receiver : msg.sender;
            userConversations[msg.sender].push(convHash);
            userConversations[_receiver].push(convHash);
        }
        
        conversations[convHash].messageIds.push(messageCount);
        conversations[convHash].lastMessageTime = block.timestamp;

        emit MessageSent(messageCount, msg.sender, _receiver, block.timestamp);
    }

    // Mark message as read
    function markAsRead(uint256 _messageId) public {
        require(_messageId > 0 && _messageId <= messageCount, "Invalid message");
        Message storage message = messages[_messageId];
        require(message.receiver == msg.sender, "Not your message");
        require(!message.isRead, "Already read");

        message.isRead = true;
        if (unreadCount[msg.sender] > 0) {
            unreadCount[msg.sender]--;
        }

        emit MessageRead(_messageId, msg.sender);
    }

    // Mark all messages from a user as read
    function markConversationAsRead(address _otherUser) public {
        bytes32 convHash = getConversationHash(msg.sender, _otherUser);
        Conversation storage conv = conversations[convHash];
        
        for (uint256 i = 0; i < conv.messageIds.length; i++) {
            uint256 msgId = conv.messageIds[i];
            Message storage message = messages[msgId];
            
            if (message.receiver == msg.sender && !message.isRead) {
                message.isRead = true;
                if (unreadCount[msg.sender] > 0) {
                    unreadCount[msg.sender]--;
                }
                emit MessageRead(msgId, msg.sender);
            }
        }
    }

    // Delete message (soft delete)
    function deleteMessage(uint256 _messageId) public {
        require(_messageId > 0 && _messageId <= messageCount, "Invalid message");
        Message storage message = messages[_messageId];
        require(message.sender == msg.sender || message.receiver == msg.sender, "Not authorized");
        require(!message.isDeleted, "Already deleted");

        message.isDeleted = true;
        
        emit MessageDeleted(_messageId, msg.sender);
    }

    // Block a user
    function blockUser(address _user) public {
        require(_user != msg.sender, "Cannot block yourself");
        require(!isBlocked[msg.sender][_user], "Already blocked");

        isBlocked[msg.sender][_user] = true;
        
        emit UserBlocked(msg.sender, _user);
    }

    // Unblock a user
    function unblockUser(address _user) public {
        require(isBlocked[msg.sender][_user], "Not blocked");

        isBlocked[msg.sender][_user] = false;
        
        emit UserUnblocked(msg.sender, _user);
    }

    // Get conversation messages
    function getConversation(address _otherUser) public view returns (Message[] memory) {
        bytes32 convHash = getConversationHash(msg.sender, _otherUser);
        Conversation storage conv = conversations[convHash];
        
        uint256 validCount = 0;
        for (uint256 i = 0; i < conv.messageIds.length; i++) {
            if (!messages[conv.messageIds[i]].isDeleted) {
                validCount++;
            }
        }
        
        Message[] memory msgs = new Message[](validCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < conv.messageIds.length; i++) {
            uint256 msgId = conv.messageIds[i];
            if (!messages[msgId].isDeleted) {
                msgs[index] = messages[msgId];
                index++;
            }
        }
        
        return msgs;
    }

    // Get user's conversations list
    function getUserConversations(address _user) public view returns (Conversation[] memory) {
        bytes32[] memory convHashes = userConversations[_user];
        Conversation[] memory convs = new Conversation[](convHashes.length);
        
        for (uint256 i = 0; i < convHashes.length; i++) {
            convs[i] = conversations[convHashes[i]];
        }
        
        return convs;
    }

    // Get last message in conversation
    function getLastMessage(address _otherUser) public view returns (Message memory) {
        bytes32 convHash = getConversationHash(msg.sender, _otherUser);
        Conversation storage conv = conversations[convHash];
        
        require(conv.messageIds.length > 0, "No messages");
        
        // Find last non-deleted message
        for (uint256 i = conv.messageIds.length; i > 0; i--) {
            uint256 msgId = conv.messageIds[i - 1];
            if (!messages[msgId].isDeleted) {
                return messages[msgId];
            }
        }
        
        revert("No valid messages");
    }

    // Get unread count for conversation
    function getConversationUnreadCount(address _otherUser) public view returns (uint256) {
        bytes32 convHash = getConversationHash(msg.sender, _otherUser);
        Conversation storage conv = conversations[convHash];
        
        uint256 count = 0;
        for (uint256 i = 0; i < conv.messageIds.length; i++) {
            uint256 msgId = conv.messageIds[i];
            Message storage message = messages[msgId];
            if (message.receiver == msg.sender && !message.isRead && !message.isDeleted) {
                count++;
            }
        }
        
        return count;
    }

    // Get message by ID
    function getMessage(uint256 _messageId) public view returns (Message memory) {
        require(_messageId > 0 && _messageId <= messageCount, "Invalid message");
        Message memory message = messages[_messageId];
        require(message.sender == msg.sender || message.receiver == msg.sender, "Not authorized");
        
        return message;
    }

    // Check if user is blocked
    function checkBlocked(address _user) public view returns (bool) {
        return isBlocked[msg.sender][_user];
    }

    // Get total unread messages
    function getUnreadCount() public view returns (uint256) {
        return unreadCount[msg.sender];
    }
}
