import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';

export function useBookmark() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const bookmarkPost = (postId: number) => {
    writeContract({
      address: SOCIAL_MEDIA_CONTRACT.address,
      abi: SOCIAL_MEDIA_CONTRACT.abi,
      functionName: 'bookmarkPost',
      args: [BigInt(postId)],
    });
  };

  const unbookmarkPost = (postId: number) => {
    writeContract({
      address: SOCIAL_MEDIA_CONTRACT.address,
      abi: SOCIAL_MEDIA_CONTRACT.abi,
      functionName: 'unbookmarkPost',
      args: [BigInt(postId)],
    });
  };

  return {
    bookmarkPost,
    unbookmarkPost,
    isLoading: isPending || isConfirming,
    isSuccess,
  };
}