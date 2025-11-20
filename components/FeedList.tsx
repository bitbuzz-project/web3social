'use client';

import { useReadContract } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import PostCard from './PostCard';
import { Loader2 } from 'lucide-react';

export default function FeedList() {
  const { data: postCount } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'postCount',
  });

  const totalPosts = postCount ? Number(postCount) : 0;

  if (totalPosts === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg">No posts yet</p>
        <p className="text-sm mt-2">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: totalPosts }, (_, i) => totalPosts - i).map((postId) => (
        <PostItem key={postId} postId={postId} />
      ))}
    </div>
  );
}

function PostItem({ postId }: { postId: number }) {
  const { data: post, isLoading } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(postId)],
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!post || post.isDeleted) {
    return null;
  }

  return (
    <PostCard
      postId={Number(post.id)}
      author={post.author}
      contentHash={post.contentHash}
      timestamp={Number(post.timestamp)}
      likes={Number(post.likes)}
    />
  );
}