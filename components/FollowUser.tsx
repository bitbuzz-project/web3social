'use client';

import { useRouter } from 'next/navigation';
import { useReadContract } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { useFollow } from '@/hooks/useFollow';
import { useAccount } from 'wagmi';
import { Loader2 } from 'lucide-react';

interface FollowUserProps {
  userAddress: string;
  userName: string;
}

export default function FollowUser({ userAddress, userName }: FollowUserProps) {
  const router = useRouter();
  const { address } = useAccount();
  const { followUser, unfollowUser, isLoading } = useFollow();

  const { data: isFollowing, refetch } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'checkFollowing',
    args: [address as `0x${string}`, userAddress as `0x${string}`],
  });

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowUser(userAddress);
    } else {
      followUser(userAddress);
    }
    setTimeout(() => refetch(), 2000);
  };

  return (
    <div className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/profile/${userAddress}`)}>
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {userAddress.slice(2, 4).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-gray-900 dark:text-white hover:underline truncate">
            {userName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </div>
        </div>
      </div>
      <button
        onClick={handleFollowToggle}
        disabled={isLoading}
        className={`px-4 py-1.5 rounded-full font-bold text-sm transition flex items-center gap-2 flex-shrink-0 ${
          isFollowing
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
        } disabled:opacity-50`}
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isFollowing ? (
          'Following'
        ) : (
          'Follow'
        )}
      </button>
    </div>
  );
}