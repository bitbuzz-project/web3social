'use client';

import { useReadContract } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import PostCard from './PostCard';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFromIPFS } from '@/lib/ipfs';

export default function FeedList({ searchQuery = '' }: { searchQuery?: string }) {
  const [visiblePosts, setVisiblePosts] = useState(10);
  const [filteredPosts, setFilteredPosts] = useState<number[]>([]);
  const [allPosts, setAllPosts] = useState<number[]>([]);

  const { data: postCount, isLoading: countLoading } = useReadContract({
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

  if (countLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (totalPosts === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <p className="text-lg font-semibold mb-2">No posts yet</p>
          <p className="text-sm">Be the first to share something!</p>
        </div>
      </div>
    );
  }

  if (searchQuery && filteredPosts.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <p className="text-lg font-semibold mb-2">No results found</p>
          <p className="text-sm">Try a different search term</p>
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

function PostItem({ postId }: { postId: number }) {
  const { data: post, isLoading } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(postId)],
  });

  if (isLoading) {
    return (
      <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-3 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          </div>
        </div>
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