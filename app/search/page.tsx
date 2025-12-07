'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReadContract } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import { Search, User, Hash, FileText, Loader2 } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'hashtags'>('posts');

  const { data: postCount } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'postCount',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1280px] mx-auto flex">
        <div className="w-[68px] xl:w-[275px] flex-shrink-0">
          <div className="fixed w-[68px] xl:w-[275px] h-screen border-r border-gray-200 dark:border-gray-800">
            <FeedNavigation />
          </div>
        </div>

        <div className="flex-1 min-h-screen border-x border-gray-200 dark:border-gray-800">
          {/* Search Header */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSearch} className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users, posts, hashtags..."
                  className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              {[
                { id: 'posts', label: 'Posts', icon: FileText },
                { id: 'users', label: 'Users', icon: User },
                { id: 'hashtags', label: 'Hashtags', icon: Hash },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-4 font-semibold hover:bg-gray-50 dark:hover:bg-gray-900/50 transition relative ${
                      activeTab === tab.id
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </div>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div>
            {!query ? (
              <div className="flex flex-col items-center justify-center py-16 px-8">
                <Search size={64} className="text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Search Web3Social
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Find users, posts, and trending hashtags
                </p>
              </div>
            ) : (
              <>
                {activeTab === 'posts' && <SearchPosts query={query} postCount={postCount} />}
                {activeTab === 'users' && <SearchUsers query={query} />}
                {activeTab === 'hashtags' && <SearchHashtags query={query} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchPosts({ query, postCount }: { query: string; postCount?: bigint }) {
  const [results, setResults] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Search through posts
  React.useEffect(() => {
    async function searchPosts() {
      if (!postCount) return;
      setLoading(true);
      const total = Number(postCount);
      const matches: number[] = [];

      // Simple search - you can enhance this
      for (let i = total; i >= 1 && matches.length < 20; i--) {
        matches.push(i);
      }

      setResults(matches);
      setLoading(false);
    }
    searchPosts();
  }, [query, postCount]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No posts found for "{query}"
      </div>
    );
  }

  return (
    <div>
      {results.map((postId) => (
        <SearchPostItem key={postId} postId={postId} query={query} />
      ))}
    </div>
  );
}

function SearchPostItem({ postId, query }: { postId: number; query: string }) {
  const { data: post } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(postId)],
  });

  if (!post || post.isDeleted) return null;

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

function SearchUsers({ query }: { query: string }) {
  return (
    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
      User search coming soon...
    </div>
  );
}

function SearchHashtags({ query }: { query: string }) {
  return (
    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
      Hashtag search coming soon...
    </div>
  );
}