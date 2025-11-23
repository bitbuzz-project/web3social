'use client';

import { use } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { getFromIPFS, extractImageFromContent } from '@/lib/ipfs';
import { useLikePost } from '@/hooks/useLikePost';
import { useComment } from '@/hooks/useComment';
import TextWithHashtags from '@/components/TextWithHashtags';
import FeedNavigation from '@/components/FeedNavigation';
import { ArrowLeft, Heart, MessageCircle, Share, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const postId = parseInt(id);
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [content, setContent] = useState('Loading...');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const { likePost, unlikePost, isLoading: likeLoading } = useLikePost();
  const { addComment, isLoading: commentLoading, isSuccess: commentSuccess } = useComment();

  const { data: post, isLoading: postLoading } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(postId)],
  });

  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: post?.author as `0x${string}`,
    query: { enabled: !!post?.author },
  });

  const { data: hasLiked, refetch: refetchLike } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'hasLiked',
    args: [BigInt(postId), address as `0x${string}`],
  });

  const { data: comments, refetch: refetchComments } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getComments',
    args: [BigInt(postId)],
  });

  useEffect(() => {
    if (!isConnected) router.push('/');
  }, [isConnected, router]);

  useEffect(() => {
    if (post?.contentHash) {
      getFromIPFS(post.contentHash).then(text => {
        const { text: postText, imageUrl: extractedImage } = extractImageFromContent(text);
        setContent(postText);
        setImageUrl(extractedImage);
      }).catch(() => setContent('Failed to load'));
    }
  }, [post?.contentHash]);

  useEffect(() => {
    if (commentSuccess) {
      setCommentText('');
      setTimeout(() => refetchComments(), 2000);
    }
  }, [commentSuccess, refetchComments]);

  if (!isConnected || postLoading) return null;
  if (!post) return <div>Post not found</div>;

  const username = profile?.username || `user_${post.author?.slice(-4)}`;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1280px] mx-auto flex">
        <div className="w-[68px] xl:w-[275px] flex-shrink-0">
          <div className="fixed w-[68px] xl:w-[275px] h-screen border-r border-gray-200 dark:border-gray-800">
            <FeedNavigation />
          </div>
        </div>

        <div className="flex-1 max-w-[600px] border-x border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Post</h1>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-4 border-b-8 border-gray-100 dark:border-gray-900">
            <div className="flex gap-3 mb-3">
              <div 
                onClick={() => router.push(`/profile/${post.author}`)}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 cursor-pointer hover:opacity-90"
              >
                {post.author.slice(2, 4).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white hover:underline cursor-pointer" onClick={() => router.push(`/profile/${post.author}`)}>
                  {username}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  {post.author.slice(0, 6)}...{post.author.slice(-4)}
                </div>
              </div>
            </div>

            <div className="text-xl text-gray-900 dark:text-white mb-3 whitespace-pre-wrap break-words">
              <TextWithHashtags text={content} />
            </div>

            {/* Image */}
            {imageUrl && (
              <div className="mb-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <img 
                  src={imageUrl} 
                  alt="Post image" 
                  className="w-full max-h-[600px] object-cover"
                />
              </div>
            )}

            <div className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              {new Date(Number(post.timestamp) * 1000).toLocaleString()}
            </div>

            <div className="flex items-center gap-6 py-3 border-y border-gray-200 dark:border-gray-800 text-sm">
              <div><span className="font-bold text-gray-900 dark:text-white">{Number(post.likes)}</span> <span className="text-gray-500 dark:text-gray-400">Likes</span></div>
              <div><span className="font-bold text-gray-900 dark:text-white">{comments?.length || 0}</span> <span className="text-gray-500 dark:text-gray-400">Comments</span></div>
            </div>

            <div className="flex items-center justify-around py-2 border-b border-gray-200 dark:border-gray-800">
              <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 group transition p-3">
                <MessageCircle size={20} />
              </button>
              <button
                onClick={() => hasLiked ? unlikePost(postId) : likePost(postId)}
                disabled={likeLoading}
                className={`flex items-center gap-2 group transition p-3 ${hasLiked ? 'text-red-600' : 'text-gray-500 dark:text-gray-400 hover:text-red-600'}`}
              >
                {likeLoading ? <Loader2 size={20} className="animate-spin" /> : <Heart size={20} fill={hasLiked ? 'currentColor' : 'none'} />}
              </button>
              <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 group transition p-3">
                <Share size={20} />
              </button>
            </div>
          </div>

          {/* Add Comment */}
          <div className="p-4 border-b-8 border-gray-100 dark:border-gray-900">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {address?.slice(2, 4).toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Post your reply"
                  className="w-full text-xl bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 min-h-[80px]"
                  disabled={commentLoading}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => addComment(postId, commentText)}
                    disabled={commentLoading || !commentText.trim()}
                    className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    {commentLoading ? <Loader2 size={18} className="animate-spin" /> : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div>
            {comments && comments.length > 0 ? (
              comments.map((comment: any) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">No comments yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: any }) {
  const [content, setContent] = useState('Loading...');
  const router = useRouter();

  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [comment.author as `0x${string}`],
  });

  useEffect(() => {
    getFromIPFS(comment.contentHash).then(setContent).catch(() => setContent('Failed to load'));
  }, [comment.contentHash]);

  const username = profile?.username || `user_${comment.author?.slice(-4)}`;

  return (
    <article className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition">
      <div className="flex gap-3">
        <div 
          onClick={() => router.push(`/profile/${comment.author}`)}
          className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 cursor-pointer hover:opacity-90"
        >
          {comment.author.slice(2, 4).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span onClick={() => router.push(`/profile/${comment.author}`)} className="font-bold text-gray-900 dark:text-white hover:underline cursor-pointer">{username}</span>
            <span className="text-gray-500 dark:text-gray-400">{comment.author.slice(0, 6)}...{comment.author.slice(-4)}</span>
            <span className="text-gray-500 dark:text-gray-400">·</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDistanceToNow(new Date(Number(comment.timestamp) * 1000), { addSuffix: true })}</span>
          </div>
          <div className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap break-words">
            <TextWithHashtags text={content} />
          </div>
        </div>
      </div>
    </article>
  );
}