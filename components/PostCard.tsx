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
import { Heart, MessageCircle, Quote, Share, MoreHorizontal, Loader2, Bookmark, Edit, Link2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  postId: number;
  author: string;
  contentHash: string;
  timestamp: number;
  likes: number;
  shares?: number;
  quotedPostId?: number;
  impressions?: number;
}

export default function PostCard({ 
  postId, 
  author, 
  contentHash, 
  timestamp, 
  likes, 
  shares = 0,
  quotedPostId = 0,
  impressions: initialImpressions = 0 
}: PostCardProps) {
  const [content, setContent] = useState('Loading...');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const { address } = useAccount();
  const router = useRouter();
  const { likePost, unlikePost, isLoading: likeLoading } = useLikePost();
  const { bookmarkPost, unbookmarkPost, isLoading: bookmarkLoading } = useBookmark();

  const isOwnPost = address?.toLowerCase() === author.toLowerCase();

  // Get full post data to check edit status and thread
  const { data: fullPost } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
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
    setShowShareMenu(false);
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
    setShowShareMenu(false);
  };

  const username = profile?.username || `user_${author?.slice(-4)}`;
  const totalComments = commentCount ? Number(commentCount) : 0;
  const isEdited = fullPost?.isEdited || false;
  const isPartOfThread = fullPost?.threadId && Number(fullPost.threadId) > 0;

  return (
    <>
      <article 
        id={`post-${postId}`}
        onClick={handlePostClick}
        className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition cursor-pointer"
      >
        <div className="flex gap-3">
          <div 
            onClick={handleProfileClick}
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 hover:opacity-90 transition"
          >
            {author.slice(2, 4).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
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
                {isEdited && (
                  <>
                    <span className="text-gray-500 dark:text-gray-400">·</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Edited</span>
                  </>
                )}
                {isPartOfThread && (
                  <>
                    <span className="text-gray-500 dark:text-gray-400">·</span>
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
                  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition flex-shrink-0"
                >
                  <MoreHorizontal size={18} className="text-gray-500 dark:text-gray-400" />
                </button>

                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-[200px]">
                    {isOwnPost && canEdit && (
                      <button
                        onClick={handleEdit}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-900 dark:text-white"
                      >
                        <Edit size={16} />
                        Edit post
                      </button>
                    )}
                    <button
                      onClick={handleCopyLink}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-900 dark:text-white"
                    >
                      <Share size={16} />
                      Copy link
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap break-words">
              <TextWithHashtags text={content} />
            </div>

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

            {/* Quoted Post */}
            {quotedPostId > 0 && quotedPost && (
              <QuotedPostPreview post={quotedPost} />
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
                {totalComments > 0 && <span className="text-sm">{totalComments}</span>}
              </button>

              <button 
                onClick={handleQuote}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-500 group transition"
              >
                <div className="p-2 group-hover:bg-green-50 dark:group-hover:bg-green-900/20 rounded-full transition">
                  <Quote size={18} />
                </div>
                {shares > 0 && <span className="text-sm">{shares}</span>}
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
                {likes > 0 && <span className="text-sm">{likes}</span>}
              </button>

              <button
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading}
                className={`flex items-center gap-2 group transition ${
                  hasBookmarked ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600'
                } disabled:opacity-50`}
              >
                <div className={`p-2 rounded-full transition ${
                  hasBookmarked ? 'bg-blue-50 dark:bg-blue-900/20' : 'group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'
                }`}>
                  {bookmarkLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Bookmark size={18} fill={hasBookmarked ? 'currentColor' : 'none'} />
                  )}
                </div>
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyLink(e);
                }}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 group transition"
              >
                <div className="p-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 rounded-full transition">
                  <Share size={18} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </article>

      <QuotePostModal 
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        quotedPostId={postId}
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
    <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
      <div className="flex gap-2 mb-2">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {post.author?.slice(2, 4).toUpperCase()}
        </div>
        <div>
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            {username}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
            {post.author?.slice(0, 6)}...{post.author?.slice(-4)}
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-900 dark:text-white line-clamp-3">
        <TextWithHashtags text={content} />
      </div>
    </div>
  );
}