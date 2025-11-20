'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import EditProfileModal from '@/components/EditProfileModal';
import FeedNavigation from '@/components/FeedNavigation';
import { MapPin, Calendar, Link as LinkIcon, ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [address as `0x${string}`],
  });

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

  const username = profile?.username || `user_${address?.slice(-4)}`;
  const bio = profile?.bio || 'Web3 enthusiast 🚀 | NFT collector | DeFi explorer';
  const followerCount = profile?.followerCount ? Number(profile.followerCount) : 0;
  const followingCount = profile?.followingCount ? Number(profile.followingCount) : 0;

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
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-8 px-4 py-3">
              <button 
                onClick={() => router.push('/feed')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{username}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">0 posts</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div>
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            
            <div className="px-4 pb-4">
              <div className="flex justify-between items-start -mt-16 mb-4">
                <div className="w-32 h-32 bg-white dark:bg-black rounded-full border-4 border-white dark:border-black shadow-lg flex items-center justify-center text-4xl font-bold text-blue-600">
                  {address?.slice(2, 4).toUpperCase()}
                </div>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="mt-16 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-6 py-2 rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                >
                  Edit profile
                </button>
              </div>

              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{username}</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-3">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>

              <p className="text-gray-900 dark:text-white mb-3">{bio}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>Joined November 2024</span>
                </div>
              </div>

              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">{followingCount}</span>
                  <span className="text-gray-500 dark:text-gray-400"> Following</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">{followerCount}</span>
                  <span className="text-gray-500 dark:text-gray-400"> Followers</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex">
                <button className="flex-1 py-4 font-semibold text-gray-900 dark:text-white border-b-4 border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                  Posts
                </button>
                <button className="flex-1 py-4 font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                  Replies
                </button>
                <button className="flex-1 py-4 font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                  Likes
                </button>
              </div>
            </div>

            {/* Posts */}
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">No posts yet</p>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        currentProfile={{
          username,
          bio,
          avatarHash: '',
        }}
      />
    </div>
  );
}