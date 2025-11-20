import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';

export function useLikePost() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const likePost = (postId: number) => {
    writeContract({
      address: SOCIAL_MEDIA_CONTRACT.address,
      abi: SOCIAL_MEDIA_CONTRACT.abi,
      functionName: 'likePost',
      args: [BigInt(postId)],
    });
  };

  const unlikePost = (postId: number) => {
    writeContract({
      address: SOCIAL_MEDIA_CONTRACT.address,
      abi: SOCIAL_MEDIA_CONTRACT.abi,
      functionName: 'unlikePost',
      args: [BigInt(postId)],
    });
  };

  return {
    likePost,
    unlikePost,
    isLoading: isPending || isConfirming,
    isSuccess,
  };
}