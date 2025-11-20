'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, Repeat } from 'lucide-react';

export default function NotificationsPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

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
    {
      id: 4,
      type: 'repost',
      user: '0xdef0...abc9',
      action: 'shared your post',
      time: '2 days ago',
      icon: Repeat,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full bg-gray-100 ${notification.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800">
                        <span className="font-semibold">{notification.user}</span>{' '}
                        {notification.action}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State (if no notifications) */}
          {notifications.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No notifications yet</p>
              <p className="text-sm mt-2">When someone interacts with you, you ll see it here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}