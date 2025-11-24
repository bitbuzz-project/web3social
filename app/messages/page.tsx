'use client';

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import FeedNavigation from '@/components/FeedNavigation';
import { MESSAGING_CONTRACT } from '@/lib/messagingContract';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { MessageCircle, Send, Search, Loader2, ArrowLeft } from 'lucide-react';
import { uploadToIPFS, getFromIPFS } from '@/lib/ipfs';
import { formatDistanceToNow } from 'date-fns';
import UserAvatar from '@/components/UserAvatar';
import ChatMessagesWorkaround from '@/components/ChatMessagesWorkaround';


export default function MessagesPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageAddress, setNewMessageAddress] = useState('');

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  // Check for user param in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam && /^0x[a-fA-F0-9]{40}$/.test(userParam)) {
      setSelectedUser(userParam);
    }
  }, []);

  const { data: conversations, refetch: refetchConversations } = useReadContract({
    address: MESSAGING_CONTRACT.address,
    abi: MESSAGING_CONTRACT.abi,
    functionName: 'getUserConversations',
    args: [address as `0x${string}`],
  });

  const { data: unreadCount } = useReadContract({
    address: MESSAGING_CONTRACT.address,
    abi: MESSAGING_CONTRACT.abi,
    functionName: 'getUnreadCount',
  });

  const { writeContract, isPending } = useWriteContract();

  if (!isConnected) return null;

  const handleSendMessage = async () => {
    if (!selectedUser || !messageText.trim()) return;

    try {
      const contentHash = await uploadToIPFS(messageText);
      
      writeContract(
        {
          address: MESSAGING_CONTRACT.address,
          abi: MESSAGING_CONTRACT.abi,
          functionName: 'sendMessage',
          args: [selectedUser as `0x${string}`, contentHash],
        },
        {
          onSuccess: () => {
            setMessageText('');
            setTimeout(() => {
              refetchConversations();
            }, 2000);
          },
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartConversation = () => {
    if (newMessageAddress && /^0x[a-fA-F0-9]{40}$/.test(newMessageAddress)) {
      setSelectedUser(newMessageAddress);
      setShowNewMessageModal(false);
      setNewMessageAddress('');
    }
  };

  const conversationList = conversations ? Array.from(conversations as any[]) : [];
  const totalUnread = unreadCount ? Number(unreadCount) : 0;

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-[1280px] mx-auto flex">
          {/* Left Sidebar */}
          <div className="w-[68px] xl:w-[275px] flex-shrink-0">
            <div className="fixed w-[68px] xl:w-[275px] h-screen border-r border-gray-200 dark:border-gray-800">
              <FeedNavigation />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex border-x border-gray-200 dark:border-gray-800">
            {/* Conversations List */}
            <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] flex-col border-r border-gray-200 dark:border-gray-800`}>
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageCircle size={24} />
                    Messages
                    {totalUnread > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {totalUnread}
                      </span>
                    )}
                  </h1>
                  <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
                  >
                    <Send size={18} />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search messages"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversationList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                    <MessageCircle size={64} className="text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No messages yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Start a conversation with someone!
                    </p>
                    <button
                      onClick={() => setShowNewMessageModal(true)}
                      className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
                    >
                      New Message
                    </button>
                  </div>
                ) : (
                  conversationList.map((conv: any) => {
                    const otherUser = conv.user1.toLowerCase() === address?.toLowerCase() ? conv.user2 : conv.user1;
                    return (
                      <ConversationItem
                        key={otherUser}
                        otherUser={otherUser}
                        isSelected={selectedUser === otherUser}
                        onClick={() => setSelectedUser(otherUser)}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
              {selectedUser ? (
                <>
                  <ChatHeader 
                    userAddress={selectedUser} 
                    onBack={() => setSelectedUser(null)}
                  />
                  <ChatMessages userAddress={selectedUser} />
                  <ChatInput 
                    value={messageText}
                    onChange={setMessageText}
                    onSend={handleSendMessage}
                    isLoading={isPending}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle size={80} className="text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Select a message
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Choose a conversation to start chatting
                    </p>
                    <button
                      onClick={() => setShowNewMessageModal(true)}
                      className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition"
                    >
                      New Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">New Message</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enter the wallet address of the person you want to message:
            </p>
            <input
              type="text"
              placeholder="0x..."
              value={newMessageAddress}
              onChange={(e) => setNewMessageAddress(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewMessageModal(false);
                  setNewMessageAddress('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStartConversation}
                disabled={!newMessageAddress || !/^0x[a-fA-F0-9]{40}$/.test(newMessageAddress)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ConversationItem({ otherUser, isSelected, onClick }: { otherUser: string; isSelected: boolean; onClick: () => void }) {
  const { address } = useAccount();

  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [otherUser as `0x${string}`],
  });

  const { data: lastMessage } = useReadContract({
    address: MESSAGING_CONTRACT.address,
    abi: MESSAGING_CONTRACT.abi,
    functionName: 'getLastMessage',
    args: [otherUser as `0x${string}`],
  });

  const { data: unreadCount } = useReadContract({
    address: MESSAGING_CONTRACT.address,
    abi: MESSAGING_CONTRACT.abi,
    functionName: 'getConversationUnreadCount',
    args: [otherUser as `0x${string}`],
  });

  const [lastMessageText, setLastMessageText] = useState('');

  useEffect(() => {
    if (lastMessage?.contentHash) {
      getFromIPFS(lastMessage.contentHash).then(setLastMessageText).catch(() => setLastMessageText(''));
    }
  }, [lastMessage?.contentHash]);

  const username = profile?.username || `user_${otherUser.slice(-4)}`;
  const unread = unreadCount ? Number(unreadCount) : 0;
  const isUnread = unread > 0;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <UserAvatar address={otherUser as `0x${string}`} size="lg" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`font-bold text-gray-900 dark:text-white truncate ${isUnread ? 'font-extrabold' : ''}`}>
            {username}
          </span>
          {lastMessage && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(Number(lastMessage.timestamp) * 1000), { addSuffix: true })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate ${isUnread ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
            {lastMessageText || 'Start a conversation'}
          </p>
          {isUnread && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatHeader({ userAddress, onBack }: { userAddress: string; onBack: () => void }) {
  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [userAddress as `0x${string}`],
  });

  const username = profile?.username || `user_${userAddress.slice(-4)}`;

  return (
    <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <UserAvatar address={userAddress as `0x${string}`} size="md" />
        <div className="flex-1">
          <h2 className="font-bold text-gray-900 dark:text-white">{username}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChatMessages({ userAddress }: { userAddress: string }) {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check total message count in contract
  const { data: messageCount } = useReadContract({
    address: MESSAGING_CONTRACT.address,
    abi: MESSAGING_CONTRACT.abi,
    functionName: 'messageCount',
  });

  // Try to read message 1 directly
  const { data: message1 } = useReadContract({
    address: MESSAGING_CONTRACT.address,
    abi: MESSAGING_CONTRACT.abi,
    functionName: 'messages',
    args: [BigInt(1)],
  });

  // Try to read message 2 directly
  const { data: message2 } = useReadContract({
    address: MESSAGING_CONTRACT.address,
    abi: MESSAGING_CONTRACT.abi,
    functionName: 'messages',
    args: [BigInt(2)],
  });

  const { data: messages, refetch, isError, error } = useReadContract({
    address: MESSAGING_CONTRACT.address,
    abi: MESSAGING_CONTRACT.abi,
    functionName: 'getConversation',
    args: [userAddress as `0x${string}`],
  });

  // Debug: log messages
  useEffect(() => {
    console.log('=== MESSAGE DEBUG ===');
    console.log('Total messages in contract:', messageCount ? Number(messageCount) : 0);
    
    if (message1) {
      console.log('Message 1 details:', {
        id: message1[0] ? Number(message1[0]) : 'N/A',
        sender: message1[1],
        receiver: message1[2],
        contentHash: message1[3],
        timestamp: message1[4] ? Number(message1[4]) : 'N/A',
        isRead: message1[5],
        isDeleted: message1[6]
      });
    }
    
    if (message2) {
      console.log('Message 2 details:', {
        id: message2[0] ? Number(message2[0]) : 'N/A',
        sender: message2[1],
        receiver: message2[2],
        contentHash: message2[3],
        timestamp: message2[4] ? Number(message2[4]) : 'N/A',
        isRead: message2[5],
        isDeleted: message2[6]
      });
    }
    
    console.log('User address (other person):', userAddress);
    console.log('My address (logged in):', address);
    console.log('Messages data:', messages);
    console.log('Messages type:', typeof messages);
    console.log('Is array:', Array.isArray(messages));
    if (Array.isArray(messages)) {
      console.log('Messages length:', messages.length);
      console.log('Messages content:', JSON.stringify(messages, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      , 2));
    }
    console.log('Is Error:', isError);
    if (error) {
      console.log('Error details:', error);
    }
    console.log('===================');
  }, [messages, isError, error, userAddress, address, messageCount, message1, message2]);

  useEffect(() => {
    // Mark conversation as read when opened
    if (messages && messages.length > 0) {
      writeContract({
        address: MESSAGING_CONTRACT.address,
        abi: MESSAGING_CONTRACT.abi,
        functionName: 'markConversationAsRead',
        args: [userAddress as `0x${string}`],
      });
    }
  }, [messages, userAddress]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Refresh messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const messageList = messages ? Array.from(messages as any[]) : [];

  if (messageList.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messageList.map((msg: any) => (
        <MessageBubble key={Number(msg.id)} message={msg} isOwn={msg.sender.toLowerCase() === address?.toLowerCase()} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageBubble({ message, isOwn }: { message: any; isOwn: boolean }) {
  const [content, setContent] = useState('Loading...');

  useEffect(() => {
    getFromIPFS(message.contentHash).then(setContent).catch(() => setContent('Failed to load'));
  }, [message.contentHash]);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'} rounded-2xl px-4 py-2`}>
        <p className="whitespace-pre-wrap break-words">{content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {formatDistanceToNow(new Date(Number(message.timestamp) * 1000), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

function ChatInput({ value, onChange, onSend, isLoading }: { value: string; onChange: (v: string) => void; onSend: () => void; isLoading: boolean }) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && onSend()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          onClick={onSend}
          disabled={isLoading || !value.trim()}
          className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
}