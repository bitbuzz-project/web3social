'use client';

import { use } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { useFollow } from '@/hooks/useFollow';
import { MapPin, Calendar, Link as LinkIcon, ArrowLeft, Loader2 } from 'lucide-react';

export default function UserProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const { address: currentUser } = useAccount();
  const router = useRouter();
  const { followUser, unfollowUser, isLoading: followLoading } = useFollow();

  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [address as `0x${string}`],
  });

  const { data: isFollowing, refetch } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'checkFollowing',
    args: [currentUser as `0x${string}`, address as `0x${string}`],
  });

  const isOwnProfile = currentUser?.toLowerCase() === address.toLowerCase();

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowUser(address);
    } else {
      followUser(address);
    }
    setTimeout(() => refetch(), 2000);
  };

  const username = profile?.username || `user_${address?.slice(-4)}`;
  const bio = profile?.bio || 'Web3 enthusiast 🚀';
  const followerCount = profile?.followerCount ? Number(profile.followerCount) : 0;
  const followingCount = profile?.followingCount ? Number(profile.followingCount) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>
          
          <div className="px-6 pb-6">
            <div className="flex justify-between items-start -mt-16 mb-4">
              <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center text-4xl font-bold text-blue-600">
                {address?.slice(2, 4).toUpperCase()}
              </div>
              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`mt-16 px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                    isFollowing
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {followLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isFollowing ? (
                    'Following'
                  ) : (
                    'Follow'
                  )}
                </button>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{username}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>

            <p className="text-gray-700 dark:text-gray-300 mb-4">{bio}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>Metaverse</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Joined November 2024</span>
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-bold text-gray-900 dark:text-white">{followingCount}</span>
                <span className="text-gray-600 dark:text-gray-400"> Following</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white">{followerCount}</span>
                <span className="text-gray-600 dark:text-gray-400"> Followers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Posts</h2>
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            User posts will appear here
          </div>
        </div>
      </div>
    </div>
  );
}