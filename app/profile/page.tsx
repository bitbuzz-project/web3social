'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import EditProfileModal from '@/components/EditProfileModal';
import { MapPin, Calendar, Link as LinkIcon } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>
          
          <div className="px-6 pb-6">
            <div className="flex justify-between items-start -mt-16 mb-4">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-blue-600">
                {address?.slice(2, 4).toUpperCase()}
              </div>
              <button
                onClick={() => setIsEditOpen(true)}
                className="mt-16 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">{username}</h1>
            <p className="text-gray-500 mb-4">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>

            <p className="text-gray-700 mb-4">{bio}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>Metaverse</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Joined November 2024</span>
              </div>
              <div className="flex items-center gap-1">
                <LinkIcon size={16} />
                <a href="#" className="text-blue-600 hover:underline">
                  web3social.com
                </a>
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-bold text-gray-900">{followingCount}</span>
                <span className="text-gray-600"> Following</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{followerCount}</span>
                <span className="text-gray-600"> Followers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button className="px-6 py-4 font-semibold text-blue-600 border-b-2 border-blue-600">
                Posts
              </button>
              <button className="px-6 py-4 font-semibold text-gray-600 hover:text-gray-900">
                Likes
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center text-gray-500 py-12">
              No posts yet. Start sharing your thoughts!
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