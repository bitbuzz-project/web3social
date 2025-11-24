'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FeedNavigation from '@/components/FeedNavigation';
import { Users, Sparkles } from 'lucide-react';

export default function CommunitiesPage() {
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
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={24} />
              Communities
            </h1>
          </div>

          {/* Coming Soon */}
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-6">
              <Sparkles size={40} className="text-purple-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Join Communities
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
              Discover and join communities based on your interests. Connect with like-minded people!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
              {[
                { name: 'DeFi Enthusiasts', members: '12.5K', icon: '💰' },
                { name: 'NFT Collectors', members: '8.3K', icon: '🖼️' },
                { name: 'Web3 Developers', members: '15.2K', icon: '👩‍💻' },
                { name: 'Crypto Traders', members: '20.1K', icon: '📈' },
              ].map((community) => (
                <div
                  key={community.name}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-purple-500 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{community.icon}</div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{community.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{community.members} members</p>
                    </div>
                  </div>
                  <button className="w-full mt-3 bg-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-600 transition">
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}