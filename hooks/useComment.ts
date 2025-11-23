import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { uploadToIPFS } from '@/lib/ipfs';

export function useComment() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const addComment = async (postId: number, content: string) => {
    const contentHash = await uploadToIPFS(content);
    
    writeContract({
      address: SOCIAL_MEDIA_CONTRACT.address,
      abi: SOCIAL_MEDIA_CONTRACT.abi,
      functionName: 'addComment',
      args: [BigInt(postId), contentHash],
    });
  };

  return {
    addComment,
    isLoading: isPending || isConfirming,
    isSuccess,
  };
}