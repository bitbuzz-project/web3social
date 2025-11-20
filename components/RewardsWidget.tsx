'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { REWARD_TOKEN_CONTRACT, REWARD_SYSTEM_CONTRACT } from '@/lib/rewardContract';
import { formatUnits } from 'viem';
import { Coins, TrendingUp, Award, Loader2 } from 'lucide-react';

export default function RewardsWidget() {
  const { address } = useAccount();

  const { data: pendingRewards } = useReadContract({
    address: REWARD_SYSTEM_CONTRACT.address,
    abi: REWARD_SYSTEM_CONTRACT.abi,
    functionName: 'getPendingRewards',
    args: [address as `0x${string}`],
  });

  const { data: totalEarned } = useReadContract({
    address: REWARD_SYSTEM_CONTRACT.address,
    abi: REWARD_SYSTEM_CONTRACT.abi,
    functionName: 'getTotalEarned',
    args: [address as `0x${string}`],
  });

  const { data: tokenBalance } = useReadContract({
    address: REWARD_TOKEN_CONTRACT.address,
    abi: REWARD_TOKEN_CONTRACT.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });

  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClaim = () => {
    writeContract({
      address: REWARD_SYSTEM_CONTRACT.address,
      abi: REWARD_SYSTEM_CONTRACT.abi,
      functionName: 'claimRewards',
    });
  };

  if (isSuccess) {
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  const isLoading = isPending || isConfirming;
  const pending = pendingRewards ? formatUnits(pendingRewards, 18) : '0';
  const earned = totalEarned ? formatUnits(totalEarned, 18) : '0';
  const balance = tokenBalance ? formatUnits(tokenBalance, 18) : '0';

  return (
    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Coins size={24} />
          Your Rewards
        </h3>
        <Award size={24} className="opacity-50" />
      </div>

      <div className="space-y-4">
        {/* Pending Rewards */}
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm opacity-90 mb-1">Pending Rewards</div>
          <div className="text-3xl font-bold">{parseFloat(pending).toFixed(2)} SRCOIN</div>
        </div>

        {/* Token Balance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs opacity-80 mb-1">Balance</div>
            <div className="text-lg font-bold">{parseFloat(balance).toFixed(2)}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs opacity-80 mb-1">Total Earned</div>
            <div className="text-lg font-bold">{parseFloat(earned).toFixed(2)}</div>
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={isLoading || parseFloat(pending) === 0}
          className="w-full bg-white text-orange-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {isPending ? 'Claiming...' : 'Confirming...'}
            </>
          ) : (
            <>
              <TrendingUp size={18} />
              Claim Rewards
            </>
          )}
        </button>

        {isSuccess && (
          <div className="text-sm text-center bg-green-500/30 p-2 rounded">
            ✅ Rewards claimed successfully!
          </div>
        )}
      </div>
    </div>
  );
}