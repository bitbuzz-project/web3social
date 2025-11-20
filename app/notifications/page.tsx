'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FeedNavigation from '@/components/FeedNavigation';
import { Heart, MessageCircle, UserPlus, Repeat } from 'lucide-react';

export default function NotificationsPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) return null;

  const notifications = [
    {
      id: 1,
      type: 'like',
      user: '0x1234...5678',
      action: 'liked your post',
      time: '2 hours ago',
      icon: Heart,
      color: 'text-red-500',
    },
    {
      id: 2,
      type: 'comment',
      user: '0xabcd...ef12',
      action: 'commented on your post',
      time: '5 hours ago',
      icon: MessageCircle,
      color: 'text-blue-500',
    },
    {
      id: 3,
      type: 'follow',
      user: '0x9876...4321',
      action: 'started following you',
      time: '1 day ago',
      icon: UserPlus,
      color: 'text-green-500',
    },
  ];

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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 cursor-pointer transition"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${notification.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white">
                        <span className="font-bold">{notification.user}</span>{' '}
                        {notification.action}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}