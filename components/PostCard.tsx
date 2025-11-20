'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { getFromIPFS } from '@/lib/ipfs';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { useLikePost } from '@/hooks/useLikePost';
import { useFollow } from '@/hooks/useFollow';
import { Heart, MessageCircle, Share2, Loader2, UserPlus, UserMinus, MoreHorizontal } from 'lucide-react';
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
  const { followUser, unfollowUser, isLoading: followLoading } = useFollow();

  const isOwnPost = address?.toLowerCase() === author.toLowerCase();

  const { data: hasLiked, refetch: refetchLike } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'hasLiked',
    args: [BigInt(postId), address as `0x${string}`],
  });

  const { data: isFollowing, refetch: refetchFollow } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'checkFollowing',
    args: [address as `0x${string}`, author as `0x${string}`],
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

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowUser(author);
    } else {
      followUser(author);
    }
    setTimeout(() => refetchFollow(), 2000);
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={handleProfileClick}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {author.slice(2, 4).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold dark:text-white hover:underline">{username}</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {author.slice(0, 6)}...{author.slice(-4)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">·</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOwnPost && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition flex items-center gap-1.5 ${
                  isFollowing
                    ? 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-600'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                } disabled:opacity-50`}
              >
                {followLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isFollowing ? (
                  'Following'
                ) : (
                  'Follow'
                )}
              </button>
            )}
            <button className="p-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full transition">
              <MoreHorizontal size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        <p className="text-gray-900 dark:text-gray-100 text-[15px] mb-3 whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
        
        <div className="flex justify-between text-gray-500 dark:text-gray-400 pt-3 border-t dark:border-gray-700">
          <button
            onClick={handleLikeToggle}
            disabled={likeLoading}
            className={`flex items-center gap-2 transition group ${
              hasLiked ? 'text-red-600' : 'hover:text-red-600'
            } disabled:opacity-50`}
          >
            <div className="p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition">
              {likeLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Heart size={18} fill={hasLiked ? 'currentColor' : 'none'} strokeWidth={2} />
              )}
            </div>
            <span className="text-sm font-medium">{likes}</span>
          </button>

          <button className="flex items-center gap-2 hover:text-blue-600 transition group">
            <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition">
              <MessageCircle size={18} strokeWidth={2} />
            </div>
            <span className="text-sm font-medium">0</span>
          </button>

          <button className="flex items-center gap-2 hover:text-green-600 transition group">
            <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition">
              <Share2 size={18} strokeWidth={2} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}