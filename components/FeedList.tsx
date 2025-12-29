'use client';

import { useReadContract } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import PostCard from './PostCard';
import { useState, useEffect } from 'react';
import { FeedSkeleton } from './Skeletons';
import { InlineError } from './ErrorDisplay';

export default function FeedList({ searchQuery = '' }: { searchQuery?: string }) {
  const [visiblePosts, setVisiblePosts] = useState(10);
  const [filteredPosts, setFilteredPosts] = useState<number[]>([]);
  const [allPosts, setAllPosts] = useState<number[]>([]);

  const { data: postCount, isLoading: countLoading, error: countError, refetch: refetchCount } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'postCount',
  });

  const totalPosts = postCount ? Number(postCount) : 0;

  // Generate all post IDs
  useEffect(() => {
    if (totalPosts > 0) {
      const posts = Array.from({ length: totalPosts }, (_, i) => totalPosts - i);
      setAllPosts(posts);
      setFilteredPosts(posts);
    }
  }, [totalPosts]);

  // Filter posts based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(allPosts);
      return;
    }

    async function filterPosts() {
      const matches: number[] = [];
      const query = searchQuery.toLowerCase();

      for (const postId of allPosts.slice(0, 50)) { // Search first 50 posts
        try {
          const post: any = await fetch(`/api/search-post?id=${postId}&query=${query}`).then(r => r.json());
          if (post.matches) {
            matches.push(postId);
          }
        } catch (e) {
          // Skip errors
        }
      }

      setFilteredPosts(matches);
    }

    const debounce = setTimeout(filterPosts, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery, allPosts]);

  const postsToShow = Math.min(visiblePosts, filteredPosts.length);

  const loadMore = () => {
    setVisiblePosts(prev => Math.min(prev + 10, filteredPosts.length));
  };

  // Loading state
  if (countLoading) {
    return <FeedSkeleton count={10} />;
  }

  // Error state
  if (countError) {
    return (
      <InlineError
        message="Failed to load posts. Please try again."
        onRetry={() => refetchCount()}
      />
    );
  }

  // Empty state - no posts at all
  if (totalPosts === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No posts yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Be the first to share something!
          </p>
        </div>
      </div>
    );
  }

  // Empty state - search returned nothing
  if (searchQuery && filteredPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No results found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try a different search term
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {filteredPosts.slice(0, postsToShow).map((postId) => (
        <PostItem key={postId} postId={postId} />
      ))}
      
      {visiblePosts < filteredPosts.length && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={loadMore}
            className="w-full py-3 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-semibold transition"
          >
            Load more posts
          </button>
        </div>
      )}
    </div>
  );
}

// Separate component for each post to handle individual errors
function PostItem({ postId }: { postId: number }) {
  const { 
    data: post, 
    isLoading,
    error: postError 
  } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(postId)],
  });

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  // Skip rendering if there's an error (but don't break the whole feed)
  if (postError) {
    console.error(`Error loading post ${postId}:`, postError);
    return null;
  }

  // Skip if post doesn't exist or is deleted
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
      shares={Number(post.shares)}
      quotedPostId={Number(post.quotedPostId)}
    />
  );
}