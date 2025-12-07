'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import FeedNavigation from '@/components/FeedNavigation';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { TrendingUp, Eye, Heart, MessageCircle, Share, DollarSign, BarChart3 } from 'lucide-react';
import { formatUnits } from 'viem';
import { TIP_CONTRACT } from '@/lib/tipContract';

export default function AnalyticsPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [topPosts, setTopPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const { data: postCount } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'postCount',
  });

  useEffect(() => {
    async function analyzeUserPosts() {
      if (!postCount || !address) return;

      const total = Number(postCount);
      const userPosts: any[] = [];

      // Get user's posts with stats
      for (let i = total; i >= 1 && userPosts.length < 10; i--) {
        // Fetch and analyze
        userPosts.push({ postId: i, score: 0 });
      }

      setTopPosts(userPosts);
    }

    analyzeUserPosts();
  }, [postCount, address]);

  if (!isConnected) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1280px] mx-auto flex">
        <div className="w-[68px] xl:w-[275px] flex-shrink-0">
          <div className="fixed w-[68px] xl:w-[275px] h-screen border-r border-gray-200 dark:border-gray-800">
            <FeedNavigation />
          </div>
        </div>

        <div className="flex-1 min-h-screen border-x border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={24} className="text-blue-500" />
              Your Analytics
            </h1>
          </div>

          {/* Stats Overview */}
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Eye} label="Total Views" value="0" color="blue" />
              <StatCard icon={Heart} label="Total Likes" value="0" color="red" />
              <StatCard icon={MessageCircle} label="Total Comments" value="0" color="green" />
              <StatCard icon={DollarSign} label="Tips Earned" value="0" color="yellow" />
            </div>

            {/* Top Performing Posts */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500" />
                Top Performing Posts
              </h2>
              
              <div className="space-y-3">
                {topPosts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No posts yet to analyze</p>
                  </div>
                ) : (
                  topPosts.map((post) => (
                    <PostAnalyticsCard key={post.postId} postId={post.postId} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className={`${colors[color]} rounded-xl p-4`}>
      <Icon size={24} className="mb-2" />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}

function PostAnalyticsCard({ postId }: { postId: number }) {
  const router = useRouter();

  const { data: post } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(postId)],
  });

  const { data: tipTotal } = useReadContract({
    address: TIP_CONTRACT.address,
    abi: TIP_CONTRACT.abi,
    functionName: 'getPostTipTotal',
    args: [BigInt(postId)],
  });

  if (!post || post.isDeleted) return null;

  const engagement = Number(post.likes) + Number(post.shares);
  const impressions = Number(post.impressions);
  const engagementRate = impressions > 0 ? ((engagement / impressions) * 100).toFixed(1) : '0';

  return (
    <div 
      onClick={() => router.push(`/post/${postId}`)}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-500 transition cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          Post #{postId}
        </div>
        <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
          {engagementRate}% engagement
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
            <Eye size={14} />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{impressions}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
            <Heart size={14} />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{Number(post.likes)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Likes</div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
            <Share size={14} />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{Number(post.shares)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Shares</div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
            <DollarSign size={14} />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {tipTotal ? parseFloat(formatUnits(tipTotal, 18)).toFixed(1) : '0'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Tips</div>
        </div>
      </div>
    </div>
  );
}