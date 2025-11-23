import { useEffect } from 'react';
import { useWriteContract } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';

export function useImpression(postId: number, enabled: boolean = true) {
  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (!enabled || !postId) return;

    const timer = setTimeout(() => {
      try {
        writeContract({
          address: SOCIAL_MEDIA_CONTRACT.address,
          abi: SOCIAL_MEDIA_CONTRACT.abi,
          functionName: 'recordImpression',
          args: [BigInt(postId)],
        });
      } catch (error) {
        console.log('Impression recording skipped');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [postId, enabled, writeContract]);
}