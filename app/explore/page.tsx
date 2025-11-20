'use client';

import { Search, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { useFollow } from '@/hooks/useFollow';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users, posts, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={24} className="text-blue-600" />
                Trending Now
              </h2>
              <div className="space-y-4">
                {[
                  { tag: '#Web3', posts: '1.2K posts' },
                  { tag: '#DeFi', posts: '856 posts' },
                  { tag: '#NFTs', posts: '645 posts' },
                  { tag: '#Crypto', posts: '523 posts' },
                ].map((trend) => (
                  <div key={trend.tag} className="hover:bg-gray-50 p-3 rounded-lg cursor-pointer">
                    <div className="font-semibold text-blue-600">{trend.tag}</div>
                    <div className="text-sm text-gray-500">{trend.posts}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Who to Follow</h2>
              <div className="space-y-4">
                <SuggestedUser address="0x1234567890123456789012345678901234567890" />
                <SuggestedUser address="0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" />
                <SuggestedUser address="0x9876543210987654321098765432109876543210" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestedUser({ address }: { address: string }) {
  const { address: currentUser } = useAccount();
  const { followUser, unfollowUser, isLoading } = useFollow();

  const { data: isFollowing, refetch } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'checkFollowing',
    args: [currentUser as `0x${string}`, address as `0x${string}`],
  });

  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [address as `0x${string}`],
  });

  const handleToggle = () => {
    if (isFollowing) {
      unfollowUser(address);
    } else {
      followUser(address);
    }
    setTimeout(() => refetch(), 2000);
  };

  const followerCount = profile?.followerCount ? Number(profile.followerCount) : 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
          {address.slice(2, 4).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <div className="text-xs text-gray-500">{followerCount} followers</div>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`text-sm px-4 py-1 rounded-lg font-semibold transition ${
          isFollowing
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } disabled:opacity-50`}
      >
        {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}