'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FeedNavigation from '@/components/FeedNavigation';
import { Search, TrendingUp } from 'lucide-react';

export default function ExplorePage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) return null;

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
        <div className="flex-1 min-h-screen border-x border-gray-200 dark:border-gray-800">
          {/* Header with Search */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Trending */}
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-blue-600" />
              Trending Now
            </h2>
            <div className="space-y-1">
              {[
                { category: 'Crypto · Trending', tag: '#Web3Social', posts: '2.4K' },
                { category: 'Technology · Trending', tag: '#DeFi', posts: '1.8K' },
                { category: 'Blockchain · Trending', tag: '#Rewards', posts: '1.2K' },
                { category: 'NFTs · Trending', tag: '#BaseSepolia', posts: '945' },
              ].map((trend, i) => (
                <div
                  key={i}
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition rounded-lg"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400">{trend.category}</div>
                  <div className="font-bold text-gray-900 dark:text-white">{trend.tag}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{trend.posts} posts</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}