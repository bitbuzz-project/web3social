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

  
}