'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreatePost from '@/components/CreatePost';
import FeedList from '@/components/FeedList';
import RewardsWidget from '@/components/RewardsWidget';
import RewardRates from '@/components/RewardRates';
import FeedNavigation from '@/components/FeedNavigation';
import FollowUser from '@/components/FollowUser';
import ThreadComposer from '@/components/ThreadComposer';
import { Sparkles, Search } from 'lucide-react';

export default function FeedPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [isThreadModalOpen, setIsThreadModalOpen] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

  return (
    <>
      <div className="flex min-h-screen bg-white dark:bg-black">
        {/* Left Sidebar - Navigation */}
        <div className="w-[68px] xl:w-[275px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
          <div className="fixed w-[68px] xl:w-[275px] h-screen">
            <FeedNavigation onThreadClick={() => setIsThreadModalOpen(true)} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-[600px] border-r border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Home</h1>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition">
                <Sparkles size={20} className="text-blue-500" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              <button className="flex-1 py-4 text-gray-900 dark:text-white font-semibold border-b-4 border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                For you
              </button>
              <button className="flex-1 py-4 text-gray-500 dark:text-gray-400 font-semibold hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                Following
              </button>
            </div>
          </div>

          {/* Create Post */}
          <div className="border-b-8 border-gray-100 dark:border-gray-900">
            <CreatePost />
          </div>

          {/* Feed */}
          <FeedList />
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:flex w-[350px] flex-shrink-0">
          <div className="fixed w-[350px] h-screen flex flex-col">
            {/* Search Bar - Fixed at top */}
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-4 top-3 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4 scrollbar-hide">
              {/* Rewards Widget */}
              <RewardsWidget />

              {/* Reward Rates */}
              <RewardRates />

              {/* Trends Widget */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden">
                <div className="px-4 py-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trends for you</h2>
                </div>
                <div>
                  {[
                    { category: 'Crypto · Trending', tag: '#Web3Social', posts: '2.4K' },
                    { category: 'Technology · Trending', tag: '#DeFi', posts: '1.8K' },
                    { category: 'Blockchain · Trending', tag: '#Rewards', posts: '1.2K' },
                    { category: 'NFTs · Trending', tag: '#BaseSepolia', posts: '945' },
                  ].map((trend, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition"
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400">{trend.category}</div>
                      <div className="font-bold text-gray-900 dark:text-white">{trend.tag}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{trend.posts} posts</div>
                    </div>
                  ))}
                </div>
                <button className="px-4 py-3 text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm">
                  Show more
                </button>
              </div>

              {/* Who to Follow */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden">
                <div className="px-4 py-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Who to follow</h2>
                </div>
                <div>
                  {[
                    { address: '0x1234567890123456789012345678901234567890', name: 'Crypto.eth' },
                    { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', name: 'DeFi Master' },
                    { address: '0x9876543210987654321098765432109876543210', name: 'NFT Collector' },
                  ].map((user, i) => (
                    <FollowUser key={i} userAddress={user.address} userName={user.name} />
                  ))}
                </div>
                <button className="px-4 py-3 text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm">
                  Show more
                </button>
              </div>

              {/* Footer */}
              <div className="text-xs text-gray-500 dark:text-gray-400 px-4 pb-4 flex flex-wrap gap-2">
                <a href="#" className="hover:underline">Terms</a>
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Cookies</a>
                <div className="w-full mt-1">© 2024 Web3Social</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thread Modal - Outside all containers */}
      <ThreadComposer isOpen={isThreadModalOpen} onClose={() => setIsThreadModalOpen(false)} />
    </>
  );
}