'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { getFromIPFS, extractImageFromContent } from '@/lib/ipfs';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { useLikePost } from '@/hooks/useLikePost';
import { useShare } from '@/hooks/useShare';
import TextWithHashtags from './TextWithHashtags';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Loader2, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  postId: number;
  author: string;
  contentHash: string;
  timestamp: number;
  likes: number;
  impressions?: number;
}

export default function PostCard({ postId, author, contentHash, timestamp, likes, impressions: initialImpressions = 0 }: PostCardProps) {
  const [content, setContent] = useState('Loading...');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [localImpressions, setLocalImpressions] = useState(initialImpressions);
  const { address } = useAccount();
  const router = useRouter();
  const { likePost, unlikePost, isLoading: likeLoading } = useLikePost();
  const { sharePost, isLoading: shareLoading } = useShare();

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

  const { data: commentCount } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getCommentCount',
    args: [BigInt(postId)],
  });

  // Get updated post data for shares
  const { data: postData } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(postId)],
  });

  const shares = postData?.shares ? Number(postData.shares) : 0;

  // Track impression locally when post is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          
          // Track impression locally
          const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts') || '{}');
          if (!viewedPosts[postId]) {
            viewedPosts[postId] = true;
            localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
            
            // Increment local impression count
            setLocalImpressions(prev => prev + 1);
            
            // Optionally: Send to backend API to track impressions
            // This way you can aggregate data without blockchain costs
          }
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`post-${postId}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [postId, isVisible]);

  // Load local impression count on mount
  useEffect(() => {
    const impressionCount = parseInt(localStorage.getItem(`impressions-${postId}`) || '0');
    if (impressionCount > localImpressions) {
      setLocalImpressions(impressionCount);
    }
  }, [postId]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const text = await getFromIPFS(contentHash);
        const { text: postText, imageUrl: extractedImage } = extractImageFromContent(text);
        setContent(postText);
        setImageUrl(extractedImage);
      } catch (error) {
        console.error('Error fetching content:', error);
        setContent('Failed to load content');
      }
    };
    fetchContent();
  }, [contentHash]);

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked) {
      unlikePost(postId);
    } else {
      likePost(postId);
    }
    setTimeout(() => refetchLike(), 2000);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwnPost) {
      router.push('/profile');
    } else {
      router.push(`/profile/${author}`);
    }
  };

  const handlePostClick = () => {
    router.push(`/post/${postId}`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    setShowShareMenu(false);
  };

  const handleShareOnChain = (e: React.MouseEvent) => {
    e.stopPropagation();
    sharePost(postId);
    setShowShareMenu(false);
  };

  const username = profile?.username || `user_${author?.slice(-4)}`;
  const totalComments = commentCount ? Number(commentCount) : 0;

  // Format numbers (1.2K, 5.3M, etc.)
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <article 
      id={`post-${postId}`}
      onClick={handlePostClick}
      className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition cursor-pointer"
    >
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
            <button 
              onClick={(e) => e.stopPropagation()}
              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition flex-shrink-0"
            >
              <MoreHorizontal size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Post Content */}
          <div className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap break-words">
            <TextWithHashtags text={content} />
          </div>

          {/* Image */}
          {imageUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
              <img 
                src={imageUrl} 
                alt="Post image" 
                className="w-full max-h-[500px] object-cover"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/post/${postId}`);
              }}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 group transition"
            >
              <div className="p-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-full transition">
                <MessageCircle size={18} />
              </div>
              <span className="text-sm">{totalComments}</span>
            </button>

            <button 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-500 group transition"
            >
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

            <button 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 group transition"
              title={`${localImpressions} impressions`}
            >
              <div className="p-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-full transition">
                <BarChart3 size={18} />
              </div>
              <span className="text-sm">{formatNumber(localImpressions)}</span>
            </button>

            <div className="relative">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 group transition"
              >
                <div className="p-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-full transition">
                  {shareLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Share size={18} />
                  )}
                </div>
                <span className="text-sm">{shares}</span>
              </button>

              {showShareMenu && (
                <div 
                  className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-4 py-2 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm flex items-center gap-2"
                  >
                    <span>📋</span>
                    <span>Copy link</span>
                  </button>
                  <button
                    onClick={handleShareOnChain}
                    disabled={shareLoading}
                    className="w-full px-4 py-2 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    <span>⛓️</span>
                    <span>Share on-chain</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}