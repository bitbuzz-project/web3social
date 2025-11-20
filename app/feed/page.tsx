'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CreatePost from '@/components/CreatePost';
import FeedList from '@/components/FeedList';
import RewardsWidget from '@/components/RewardsWidget';
import RewardRates from '@/components/RewardRates';
import { TrendingUp, Users } from 'lucide-react';

export default function FeedPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-8 xl:col-span-7">
            <CreatePost />
            <div className="mt-4">
              <FeedList />
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-5">
            <div className="sticky top-20 space-y-4">
              {/* Rewards Widget */}
              <RewardsWidget />

              {/* Reward Rates */}
              <RewardRates />

              {/* Trending Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <TrendingUp size={24} className="text-blue-600" />
                  Trending
                </h2>
                <div className="space-y-3">
                  {[
                    { tag: '#Web3Social', posts: '2.4K' },
                    { tag: '#DeFi', posts: '1.8K' },
                    { tag: '#Rewards', posts: '1.2K' },
                    { tag: '#NFTs', posts: '645' },
                  ].map((trend, i) => (
                    <div
                      key={i}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition"
                    >
                      <div className="text-sm text-gray-500 dark:text-gray-400">Trending</div>
                      <div className="font-bold text-gray-900 dark:text-white">{trend.tag}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{trend.posts} posts</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}