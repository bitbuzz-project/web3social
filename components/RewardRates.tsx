'use client';

import { useReadContract } from 'wagmi';
import { REWARD_SYSTEM_CONTRACT } from '@/lib/rewardContract';
import { formatUnits } from 'viem';
import { Heart, MessageCircle, FileText } from 'lucide-react';

export default function RewardRates() {
  const { data: likeReward } = useReadContract({
    address: REWARD_SYSTEM_CONTRACT.address,
    abi: REWARD_SYSTEM_CONTRACT.abi,
    functionName: 'likeReward',
  });

  const { data: commentReward } = useReadContract({
    address: REWARD_SYSTEM_CONTRACT.address,
    abi: REWARD_SYSTEM_CONTRACT.abi,
    functionName: 'commentReward',
  });

  const { data: postReward } = useReadContract({
    address: REWARD_SYSTEM_CONTRACT.address,
    abi: REWARD_SYSTEM_CONTRACT.abi,
    functionName: 'postReward',
  });

  const like = likeReward ? formatUnits(likeReward, 18) : '0';
  const comment = commentReward ? formatUnits(commentReward, 18) : '0';
  const post = postReward ? formatUnits(postReward, 18) : '0';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        💰 Earn Rewards
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <FileText size={18} />
            <span className="font-medium">Create Post</span>
          </div>
          <span className="font-bold">{post} SRCOIN</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Heart size={18} />
            <span className="font-medium">Get Like</span>
          </div>
          <span className="font-bold">{like} SRCOIN</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <MessageCircle size={18} />
            <span className="font-medium">Get Comment</span>
          </div>
          <span className="font-bold">{comment} SRCOIN</span>
        </div>
      </div>
    </div>
  );
}