'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { getFromIPFS, extractImageFromContent } from '@/lib/ipfs';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { useLikePost } from '@/hooks/useLikePost';
import { useBookmark } from '@/hooks/useBookmark';
import QuotePostModal from './QuotePostModal';
import EditPostModal from './EditPostModal';
import TextWithHashtags from './TextWithHashtags';
import UserAvatar from './UserAvatar';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Loader2, Bookmark, Edit, Link2, DollarSign, ThumbsUp, Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TIP_CONTRACT } from '@/lib/tipContract';
import { formatUnits } from 'viem';
import TipModal from './TipModal';

interface PostCardProps {
  postId: number;
  author: string;
  contentHash: string;
  timestamp: number;
  likes: number;
  shares?: number;
  quotedPostId?: number;
}

export default function PostCard({ 
  postId, 
  author, 
  contentHash, 
  timestamp, 
  likes, 
  shares = 0,
  quotedPostId = 0,
}: PostCardProps) {
  const [content, setContent] = useState('Loading...');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const { address } = useAccount();
  const router = useRouter();
  const { likePost, unlikePost, isLoading: likeLoading } = useLikePost();
  const { bookmarkPost, unbookmarkPost, isLoading: bookmarkLoading } = useBookmark();

  const isOwnPost = address?.toLowerCase() === author.toLowerCase();
  
  // Get full post data
  const { data: fullPost } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(postId)],
  });

  const { data: tipTotal } = useReadContract({
    address: TIP_CONTRACT.address,
    abi: TIP_CONTRACT.abi,
    functionName: 'getPostTipTotal',
    args: [BigInt(postId)],
  });

  const { data: hasLiked, refetch: refetchLike } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'hasLiked',
    args: [BigInt(postId), address as `0x${string}`],
  });

  const { data: hasBookmarked, refetch: refetchBookmark } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'hasBookmarked',
    args: [address as `0x${string}`, BigInt(postId)],
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

  // Check if can edit
  const { data: canEdit } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'canEditPost',
    args: [BigInt(postId), address as `0x${string}`],
    query: { enabled: isOwnPost },
  });

  // Get quoted post if exists
  const { data: quotedPost } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(quotedPostId)],
    query: { enabled: quotedPostId > 0 },
  });

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

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasBookmarked) {
      unbookmarkPost(postId);
    } else {
      bookmarkPost(postId);
    }
    setTimeout(() => refetchBookmark(), 2000);
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

  const handleQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuoteModal(true);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
    setShowMoreMenu(false);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    setShowMoreMenu(false);
  };

  const username = profile?.username || `user_${author?.slice(-4)}`;
  const totalComments = commentCount ? Number(commentCount) : 0;
  const isEdited = fullPost?.isEdited || false;
  const isPartOfThread = fullPost?.threadId && Number(fullPost.threadId) > 0;
  const tipAmount = tipTotal ? parseFloat(formatUnits(tipTotal as bigint, 18)) : 0;

  return (
    <>
      <article 
        id={`post-${postId}`}
        onClick={handlePostClick}
        className="px-6 py-4 border-b border-gray-800 hover:bg-gray-900/30 transition cursor-pointer"
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <div onClick={handleProfileClick} className="cursor-pointer flex-shrink-0">
            <UserAvatar 
              address={author as `0x${string}`} 
              size="lg"
              showVerified={true}
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span 
                  onClick={handleProfileClick}
                  className="font-bold text-white hover:underline truncate"
                >
                  {username}
                </span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500 text-sm whitespace-nowrap">
                  {formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true }).replace('about ', '')}
                </span>
                {isEdited && (
                  <>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500 text-sm">Edited</span>
                  </>
                )}
                {isPartOfThread && (
                  <>
                    <span className="text-gray-500">·</span>
                    <Link2 size={14} className="text-blue-500" title="Part of thread" />
                  </>
                )}
              </div>
              
              {/* More Menu */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoreMenu(!showMoreMenu);
                  }}
                  className="p-1.5 hover:bg-gray-800 rounded-full transition flex-shrink-0"
                >
                  <MoreHorizontal size={18} className="text-gray-400" />
                </button>

                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-gray-900 rounded-lg shadow-xl border border-gray-700 py-1 z-50 min-w-[180px]">
                    {isOwnPost && canEdit && (
                      <button
                        onClick={handleEdit}
                        className="w-full px-4 py-2.5 text-left hover:bg-gray-800 flex items-center gap-3 text-white text-sm"
                      >
                        <Edit size={16} />
                        Edit post
                      </button>
                    )}
                    <button
                      onClick={handleCopyLink}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-800 flex items-center gap-3 text-white text-sm"
                    >
                      <Link2 size={16} />
                      Copy link
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Follow Button */}
            {!isOwnPost && (
              <button 
                className="text-blue-400 text-sm font-semibold hover:text-blue-300 mb-2"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement follow functionality
                }}
              >
                Follow
              </button>
            )}

            {/* Content */}
            <div className="text-white mb-3 whitespace-pre-wrap break-words leading-relaxed">
              <TextWithHashtags text={content} />
            </div>

            {/* Image */}
            {imageUrl && (
              <div className="mb-3 rounded-xl overflow-hidden border border-gray-800">
                <img 
                  src={imageUrl} 
                  alt="Post image" 
                  className="w-full max-h-[500px] object-cover"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Quoted Post */}
            {quotedPostId > 0 && quotedPost && (
              <QuotedPostPreview post={quotedPost} />
            )}

            {/* Reactions Bar (like Diamond app) */}
            {likes > 0 && (
              <div className="flex items-center gap-1 mb-3 py-2">
                <div className="flex items-center -space-x-1">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs">
                    👍
                  </div>
                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-xs">
                    ❤️
                  </div>
                  <div className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center text-xs">
                    😮
                  </div>
                </div>
                <span className="text-gray-400 text-sm ml-1">{likes}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
              {/* Comment */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/post/${postId}`);
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition group"
              >
                <div className="p-2 group-hover:bg-blue-500/10 rounded-lg transition">
                  <MessageCircle size={18} />
                </div>
                {totalComments > 0 && <span className="text-sm">{totalComments}</span>}
              </button>

              {/* Repost/Quote */}
              <button 
                onClick={handleQuote}
                className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition group"
              >
                <div className="p-2 group-hover:bg-green-500/10 rounded-lg transition">
                  <Repeat2 size={18} />
                </div>
                {shares > 0 && <span className="text-sm">{shares}</span>}
              </button>

              {/* Like with Reaction Picker */}
              <div className="relative">
                <button
                  onClick={handleLikeToggle}
                  onMouseEnter={() => setShowReactions(true)}
                  onMouseLeave={() => setShowReactions(false)}
                  disabled={likeLoading}
                  className={`flex items-center gap-2 transition group ${
                    hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                  } disabled:opacity-50`}
                >
                  <div className={`p-2 rounded-lg transition ${
                    hasLiked ? 'bg-red-500/10' : 'group-hover:bg-red-500/10'
                  }`}>
                    {likeLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ThumbsUp size={18} fill={hasLiked ? 'currentColor' : 'none'} />
                    )}
                  </div>
                  {likes > 0 && <span className="text-sm">{likes}</span>}
                </button>

                {/* Reaction Picker */}
                {showReactions && (
                  <div 
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 rounded-full px-3 py-2 shadow-xl border border-gray-700 flex gap-1"
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                  >
                    {['👍', '❤️', '😮', '😂', '😢', '😡'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeToggle(e);
                          setShowReactions(false);
                        }}
                        className="text-xl hover:scale-125 transition-transform p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tip */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTipModal(true);
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition group"
              >
                <div className="p-2 group-hover:bg-yellow-500/10 rounded-lg transition">
                  <DollarSign size={18} />
                </div>
                {tipAmount > 0 && <span className="text-sm text-yellow-400">{tipAmount.toFixed(1)}</span>}
              </button>

              {/* Share */}
              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition group"
              >
                <div className="p-2 group-hover:bg-blue-500/10 rounded-lg transition">
                  <Link2 size={18} />
                </div>
              </button>
            </div>

            {/* Tip Earnings Display */}
            {tipAmount > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <span className="text-sm text-gray-400">
                  💎 Earned {tipAmount.toFixed(2)} SRCOIN from tips
                </span>
              </div>
            )}
          </div>
        </div>
      </article>

      <QuotePostModal 
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        quotedPostId={postId}
      />
      
      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        postId={postId}
        recipient={author}
        recipientUsername={username}
      />

      {isOwnPost && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          postId={postId}
          currentContentHash={contentHash}
        />
      )}
    </>
  );
}

function QuotedPostPreview({ post }: { post: any }) {
  const [content, setContent] = useState('Loading...');
  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [post.author as `0x${string}`],
  });

  useEffect(() => {
    if (post.contentHash) {
      getFromIPFS(post.contentHash).then(text => {
        const { text: postText } = extractImageFromContent(text);
        setContent(postText);
      }).catch(() => setContent('Failed to load'));
    }
  }, [post.contentHash]);

  const username = profile?.username || `user_${post.author?.slice(-4)}`;

  return (
    <div className="mb-3 border border-gray-700 rounded-xl p-4 bg-gray-900/50 hover:bg-gray-900 transition">
      <div className="flex gap-3 mb-2">
        <UserAvatar 
          address={post.author as `0x${string}`}
          size="sm"
          showVerified={true}
        />
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-white">
            {username}
          </span>
          <span className="text-gray-500 text-sm">
            {post.author?.slice(0, 6)}...{post.author?.slice(-4)}
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-300 line-clamp-3 pl-11">
        <TextWithHashtags text={content} />
      </div>
    </div>
  );
}