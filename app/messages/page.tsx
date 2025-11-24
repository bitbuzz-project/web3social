'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FeedNavigation from '@/components/FeedNavigation';
import { MessageCircle, Send, Search } from 'lucide-react';

export default function MessagesPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) return null;

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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle size={24} />
              Messages
            </h1>
          </div>

          {/* Coming Soon */}
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <Send size={40} className="text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Direct Messages
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
              Send private messages to other users. This feature is coming soon!
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-6 max-w-md">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                💡 <strong>Tip:</strong> Direct messaging will support end-to-end encryption and will be available in the next update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}