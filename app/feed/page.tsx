'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CreatePost from '@/components/CreatePost';
import FeedList from '@/components/FeedList';
import RewardsWidget from '@/components/RewardsWidget';
import RewardRates from '@/components/RewardRates';
import FeedNavigation from '@/components/FeedNavigation';
import { Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1280px] mx-auto flex">
        {/* Left Sidebar - Fixed Navigation */}
        <div className="w-[68px] xl:w-[275px] flex-shrink-0">
          <div className="fixed w-[68px] xl:w-[275px] h-screen border-r border-gray-200 dark:border-gray-800">
            <FeedNavigation />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-[600px] border-x border-gray-200 dark:border-gray-800">
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
        <div className="hidden lg:block w-[350px] flex-shrink-0">
          <div className="fixed w-[350px] h-screen overflow-y-auto px-4 py-2 space-y-4">
            {/* Search Bar */}
            <div className="sticky top-0 bg-white dark:bg-black py-2 z-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-full py-3 px-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

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
                  { category: 'Crypto · Trending', tag: '#Web3Social', posts: '2.4K posts' },
                  { category: 'Technology · Trending', tag: '#DeFi', posts: '1.8K posts' },
                  { category: 'Blockchain · Trending', tag: '#Rewards', posts: '1.2K posts' },
                  { category: 'NFTs · Trending', tag: '#BaseSepolia', posts: '945 posts' },
                ].map((trend, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition"
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400">{trend.category}</div>
                    <div className="font-bold text-gray-900 dark:text-white">{trend.tag}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{trend.posts}</div>
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
                  { address: '0x1234567890123456789012345678901234567890', name: 'Crypto.eth', followers: '1.2M' },
                  { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', name: 'DeFi Master', followers: '856K' },
                  { address: '0x9876543210987654321098765432109876543210', name: 'NFT Collector', followers: '645K' },
                ].map((user, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.address.slice(2, 4).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white hover:underline cursor-pointer">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.address.slice(0, 6)}...{user.address.slice(-4)}
                        </div>
                      </div>
                    </div>
                    <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-1.5 rounded-full font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
              <button className="px-4 py-3 text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm">
                Show more
              </button>
            </div>

            {/* Footer */}
            <div className="text-xs text-gray-500 dark:text-gray-400 px-4 pb-4 space-x-3">
              <a href="#" className="hover:underline">Terms of Service</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Cookie Policy</a>
              <div className="mt-1">© 2024 Web3Social</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}