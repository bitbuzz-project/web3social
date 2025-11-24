'use client';

import { useEffect, useState, useRef } from 'react';
import { useAccount, useWriteContract, useReadContract, usePublicClient } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';
import UserAvatar from '@/components/UserAvatar';
import { MESSAGING_CONTRACT } from '@/lib/messagingContract';
import { getFromIPFS } from '@/lib/ipfs';
import { Send } from 'lucide-react';

// TEMPORARY WORKAROUND: Reads messages directly instead of using broken getConversation
// TODO: Remove this after redeploying the contract

interface Message {
  id: bigint;
  sender: string;
  receiver: string;
  contentHash: string;
  timestamp: bigint;
  isRead: boolean;
  isDeleted: boolean;
}

function ChatMessagesWorkaround({ userAddress }: { userAddress: string }) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Get total message count
  const { data: messageCount, refetch } = useReadContract({
    address: MESSAGING_CONTRACT.address,
    abi: MESSAGING_CONTRACT.abi,
    functionName: 'messageCount',
  });

  // Fetch all messages and filter manually
  useEffect(() => {
    async function fetchMessages() {
      if (!messageCount || !address || !publicClient) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const allMessages: Message[] = [];
      const count = Number(messageCount);

      console.log('📨 Fetching', count, 'messages from contract...');

      // Read each message individually
      for (let i = 1; i <= count; i++) {
        try {
          const msgData = await publicClient.readContract({
            address: MESSAGING_CONTRACT.address,
            abi: MESSAGING_CONTRACT.abi,
            functionName: 'messages',
            args: [BigInt(i)],
          }) as any;

          const msg: Message = {
            id: msgData[0],
            sender: msgData[1],
            receiver: msgData[2],
            contentHash: msgData[3],
            timestamp: msgData[4],
            isRead: msgData[5],
            isDeleted: msgData[6]
          };

          // Only include messages between current user and selected user
          if (!msg.isDeleted) {
            const isFromConversation = 
              (msg.sender.toLowerCase() === address.toLowerCase() && 
               msg.receiver.toLowerCase() === userAddress.toLowerCase()) ||
              (msg.sender.toLowerCase() === userAddress.toLowerCase() && 
               msg.receiver.toLowerCase() === address.toLowerCase());

            if (isFromConversation) {
              allMessages.push(msg);
              console.log(`✅ Message ${i} is part of conversation`);
            }
          }
        } catch (error) {
          console.error('Error fetching message', i, error);
        }
      }

      console.log('📬 Found', allMessages.length, 'messages in conversation');
      setMessages(allMessages);
      setLoading(false);
    }

    fetchMessages();

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      refetch();
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [messageCount, address, userAddress, publicClient, refetch]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Send className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No messages yet. Start the conversation!</h3>
          <p className="text-gray-400">Send a message to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((msg) => {
        const isOwn = msg.sender.toLowerCase() === address?.toLowerCase();
        
        return (
          <MessageBubbleWorkaround
            key={msg.id.toString()}
            message={msg}
            isOwn={isOwn}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageBubbleWorkaround({ 
  message, 
  isOwn,
}: { 
  message: Message; 
  isOwn: boolean;
}) {
  const [content, setContent] = useState<string>('Loading...');

  useEffect(() => {
    async function fetchIPFSContent() {
      try {
        const text = await getFromIPFS(message.contentHash);
        setContent(text);
      } catch (error) {
        console.error('Error fetching IPFS:', error);
        setContent('Failed to load message');
      }
    }

    fetchIPFSContent();
  }, [message.contentHash]);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        <UserAvatar 
          address={message.sender as `0x${string}`}
          size="sm"
          showVerified={false}
        />
        
        <div className="flex flex-col gap-1">
          <div 
            className={`px-4 py-2 rounded-2xl ${
              isOwn 
                ? 'bg-blue-500 text-white rounded-br-sm' 
                : 'bg-gray-800 text-white rounded-bl-sm'
            }`}
          >
            <p className="break-words">{content}</p>
          </div>
          
          <span className={`text-xs text-gray-500 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatDistanceToNow(new Date(Number(message.timestamp) * 1000), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ChatMessagesWorkaround;