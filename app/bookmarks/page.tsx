'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { Bookmark, Loader2 } from 'lucide-react';

export default function BookmarksPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const { data: bookmarks, isLoading } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getUserBookmarks',
    args: [address as `0x${string}`],
  });

  if (!isConnected) return null;

  const bookmarkList = bookmarks ? Array.from(bookmarks as bigint[]).map(Number).reverse() : [];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1280px] mx-auto flex">
        {/* Left Sidebar */}
        <div className="w-[68px] xl:w-[275px] flex-shrink-0">
          <div className="fixed w-[68px] xl:w-[275px] h-screen border-r border-gray-200 dark:border-gray-800">
            <FeedNavigation />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-[600px] border-x border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bookmark size={24} />
              Bookmarks
            </h1>
          </div>

          {/* Bookmarks List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : bookmarkList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8">
              <Bookmark size={64} className="text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Save posts for later
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Bookmark posts to easily find them again in the future.
              </p>
            </div>
          ) : (
            <div>
              {bookmarkList.map((postId) => (
                <BookmarkedPost key={postId} postId={postId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookmarkedPost({ postId }: { postId: number }) {
  const { data: post, isLoading } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(postId)],
  });

  if (isLoading) return null;
  if (!post || post.isDeleted) return null;

  return (
    <PostCard
      postId={Number(post.id)}
      author={post.author}
      contentHash={post.contentHash}
      timestamp={Number(post.timestamp)}
      likes={Number(post.likes)}
      shares={Number(post.shares)}
      quotedPostId={Number(post.quotedPostId)}
    />
  );
}