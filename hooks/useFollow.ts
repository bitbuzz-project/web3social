import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';

export function useFollow() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const followUser = (userAddress: string) => {
    writeContract({
      address: SOCIAL_MEDIA_CONTRACT.address,
      abi: SOCIAL_MEDIA_CONTRACT.abi,
      functionName: 'followUser',
      args: [userAddress as `0x${string}`],
    });
  };

  const unfollowUser = (userAddress: string) => {
    writeContract({
      address: SOCIAL_MEDIA_CONTRACT.address,
      abi: SOCIAL_MEDIA_CONTRACT.abi,
      functionName: 'unfollowUser',
      args: [userAddress as `0x${string}`],
    });
  };

  return {
    followUser,
    unfollowUser,
    isLoading: isPending || isConfirming,
    isSuccess,
  };
}