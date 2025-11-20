'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FeedNavigation from '@/components/FeedNavigation';
import { useReadContract } from 'wagmi';
import { REWARD_TOKEN_CONTRACT, REWARD_SYSTEM_CONTRACT } from '@/lib/rewardContract';
import { formatUnits } from 'viem';
import { Coins, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const { data: tokenBalance } = useReadContract({
    address: REWARD_TOKEN_CONTRACT.address,
    abi: REWARD_TOKEN_CONTRACT.abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  const { data: pendingRewards } = useReadContract({
    address: REWARD_SYSTEM_CONTRACT.address,
    abi: REWARD_SYSTEM_CONTRACT.abi,
    functionName: 'getPendingRewards',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  const { data: totalEarned } = useReadContract({
    address: REWARD_SYSTEM_CONTRACT.address,
    abi: REWARD_SYSTEM_CONTRACT.abi,
    functionName: 'getTotalEarned',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  if (!mounted || !isConnected) {
    return null;
  }

  const balance = tokenBalance ? formatUnits(tokenBalance, 18) : '0';
  const pending = pendingRewards ? formatUnits(pendingRewards, 18) : '0';
  const earned = totalEarned ? formatUnits(totalEarned, 18) : '0';

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1280px] mx-auto flex">
        {/* Left Sidebar */}
        <div className="w-[68px] xl:w-[275px] flex-shrink-0">
          <div className="fixed w-[68px] xl:w-[275px] h-screen border-r border-gray-200 dark:border-gray-800">
            <FeedNavigation />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen border-x border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Wallet</h1>
          </div>

          {/* Content */}
          <div className="p-4 max-w-2xl mx-auto">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-4">
              <div className="text-sm opacity-90 mb-2">Total Balance</div>
              <div className="text-4xl font-bold mb-4">{parseFloat(balance).toFixed(2)} SRCOIN</div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <TrendingUp size={16} />
                  <span>Earned: {parseFloat(earned).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>Pending: {parseFloat(pending).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <div className="text-green-600 dark:text-green-400 text-sm font-medium mb-1">Total Earned</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{parseFloat(earned).toFixed(2)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">SRCOIN</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <div className="text-orange-600 dark:text-orange-400 text-sm font-medium mb-1">Pending</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{parseFloat(pending).toFixed(2)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">SRCOIN</div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {[
                  { type: 'reward', amount: '+10.00', desc: 'Post reward', time: '2 hours ago', icon: ArrowUpRight, color: 'text-green-600' },
                  { type: 'reward', amount: '+1.00', desc: 'Like reward', time: '5 hours ago', icon: ArrowUpRight, color: 'text-green-600' },
                  { type: 'claim', amount: '-25.00', desc: 'Claimed rewards', time: '1 day ago', icon: ArrowDownRight, color: 'text-blue-600' },
                ].map((tx, i) => {
                  const Icon = tx.icon;
                  return (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${tx.color}`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{tx.desc}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{tx.time}</div>
                        </div>
                      </div>
                      <div className={`font-bold ${tx.color}`}>{tx.amount} SRCOIN</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wallet Info */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Wallet Address</div>
              <div className="flex items-center justify-between bg-white dark:bg-black rounded-lg p-3 border border-gray-200 dark:border-gray-800">
                <code className="text-sm text-gray-600 dark:text-gray-400 truncate">{address}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(address || '')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-2 flex-shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}