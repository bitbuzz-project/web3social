'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { getFromIPFS } from '@/lib/ipfs';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { useLikePost } from '@/hooks/useLikePost';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  postId: number;
  author: string;
  contentHash: string;
  timestamp: number;
  likes: number;
}

export default function PostCard({ postId, author, contentHash, timestamp, likes }: PostCardProps) {
  const [content, setContent] = useState('Loading...');
  const { address } = useAccount();
  const router = useRouter();
  const { likePost, unlikePost, isLoading: likeLoading } = useLikePost();

  const isOwnPost = address?.toLowerCase() === author.toLowerCase();

  const { data: hasLiked, refetch: refetchLike } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'hasLiked',
    args: [BigInt(postId), address as `0x${string}`],
  });

  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [author as `0x${string}`],
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const text = await getFromIPFS(contentHash);
        setContent(text);
      } catch (error) {
        console.error('Error fetching content:', error);
        setContent('Failed to load content');
      }
    };
    fetchContent();
  }, [contentHash]);

  const handleLikeToggle = () => {
    if (hasLiked) {
      unlikePost(postId);
    } else {
      likePost(postId);
    }
    setTimeout(() => refetchLike(), 2000);
  };

  const handleProfileClick = () => {
    if (isOwnPost) {
      router.push('/profile');
    } else {
      router.push(`/profile/${author}`);
    }
  };

  const username = profile?.username || `user_${author?.slice(-4)}`;

  return (
    <article className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition cursor-pointer">
      <div className="flex gap-3">
        {/* Avatar */}
        <div 
          onClick={handleProfileClick}
          className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 hover:opacity-90 transition"
        >
          {author.slice(2, 4).toUpperCase()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span 
                onClick={handleProfileClick}
                className="font-bold text-gray-900 dark:text-white hover:underline truncate"
              >
                {username}
              </span>
              <span className="text-gray-500 dark:text-gray-400 truncate">
                {author.slice(0, 6)}...{author.slice(-4)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">·</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                {formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true })}
              </span>
            </div>
            <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition flex-shrink-0">
              <MoreHorizontal size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Post Content */}
          <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap break-words">
            {content}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 group transition">
              <div className="p-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-full transition">
                <MessageCircle size={18} />
              </div>
              <span className="text-sm">0</span>
            </button>

            <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-500 group transition">
              <div className="p-2 group-hover:bg-green-50 dark:group-hover:bg-green-900/20 rounded-full transition">
                <Repeat2 size={18} />
              </div>
              <span className="text-sm">0</span>
            </button>

            <button
              onClick={handleLikeToggle}
              disabled={likeLoading}
              className={`flex items-center gap-2 group transition ${
                hasLiked ? 'text-red-600' : 'text-gray-500 dark:text-gray-400 hover:text-red-600'
              } disabled:opacity-50`}
            >
              <div className={`p-2 rounded-full transition ${
                hasLiked ? 'bg-red-50 dark:bg-red-900/20' : 'group-hover:bg-red-50 dark:group-hover:bg-red-900/20'
              }`}>
                {likeLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Heart size={18} fill={hasLiked ? 'currentColor' : 'none'} />
                )}
              </div>
              <span className="text-sm">{likes}</span>
            </button>

            <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 group transition">
              <div className="p-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-full transition">
                <Share size={18} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}