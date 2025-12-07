'use client';

import { use } from 'react';
import { useReadContract } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import { Hash, TrendingUp, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getFromIPFS } from '@/lib/ipfs';
import { getHashtagCount } from '@/lib/hashtagTracker';

export default function HashtagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = use(params);
  const router = useRouter();
  const decodedTag = decodeURIComponent(tag).replace('#', '');
  const [matchingPosts, setMatchingPosts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: postCount } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'postCount',
  });

  const postTotal = getHashtagCount(decodedTag);

  useEffect(() => {
    async function findPosts() {
      if (!postCount) return;
      
      setLoading(true);
      const total = Number(postCount);
      const matches: number[] = [];
      const searchTag = `#${decodedTag.toLowerCase()}`;

      // Search through recent posts
      for (let i = total; i >= 1 && matches.length < 50; i--) {
        // We'll check this on render
        matches.push(i);
      }

      setMatchingPosts(matches);
      setLoading(false);
    }

    findPosts();
  }, [postCount, decodedTag]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1280px] mx-auto flex">
        <div className="w-[68px] xl:w-[275px] flex-shrink-0">
          <div className="fixed w-[68px] xl:w-[275px] h-screen border-r border-gray-200 dark:border-gray-800">
            <FeedNavigation />
          </div>
        </div>

        <div className="flex-1 min-h-screen border-x border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 px-4 py-3">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full">
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Hash size={24} className="text-blue-500" />
                  {decodedTag}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {postTotal} posts
                </p>
              </div>
              <TrendingUp size={24} className="text-blue-500" />
            </div>
          </div>

          {/* Posts */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : matchingPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8">
              <Hash size={64} className="text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No posts found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Be the first to post with #{decodedTag}
              </p>
            </div>
          ) : (
            <div>
              {matchingPosts.map((postId) => (
                <HashtagPostItem key={postId} postId={postId} hashtag={decodedTag} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HashtagPostItem({ postId, hashtag }: { postId: number; hashtag: string }) {
  const [matches, setMatches] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data: post } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(postId)],
  });

  useEffect(() => {
    async function checkPost() {
      if (!post?.contentHash) return;
      
      try {
        const content = await getFromIPFS(post.contentHash);
        const searchTag = `#${hashtag.toLowerCase()}`;
        if (content.toLowerCase().includes(searchTag)) {
          setMatches(true);
        }
      } catch (e) {
        // Skip
      }
      setLoading(false);
    }

    checkPost();
  }, [post, hashtag]);

  if (loading || !matches || !post || post.isDeleted) return null;

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