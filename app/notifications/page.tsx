'use client';

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FeedNavigation from '@/components/FeedNavigation';
import { Heart, MessageCircle, UserPlus, Quote, Share, Loader2, AtSign } from 'lucide-react';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPageReal() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const { data: notifications, isLoading, refetch } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getUserNotifications',
    args: [address as `0x${string}`],
  });

  const { data: unreadCount } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getUnreadNotificationCount',
    args: [address as `0x${string}`],
  });

  const handleMarkAllRead = () => {
    writeContract({
      address: SOCIAL_MEDIA_CONTRACT.address,
      abi: SOCIAL_MEDIA_CONTRACT.abi,
      functionName: 'markAllNotificationsRead',
    });
    setTimeout(() => refetch(), 2000);
  };

  if (!isConnected) return null;

  const notificationsList = notifications ? Array.from(notifications as any[]).reverse() : [];
  const unread = unreadCount ? Number(unreadCount) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1280px] mx-auto flex">
        <div className="w-[68px] xl:w-[275px] flex-shrink-0">
          <div className="fixed w-[68px] xl:w-[275px] h-screen border-r border-gray-200 dark:border-gray-800">
            <FeedNavigation />
          </div>
        </div>

        <div className="flex-1 min-h-screen border-x border-gray-200 dark:border-gray-800">
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Notifications
                {unread > 0 && (
                  <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </h1>
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-blue-500 hover:text-blue-600 font-semibold"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : notificationsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Heart size={32} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                When someone interacts with your posts, you'll see it here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {notificationsList.map((notification: any) => (
                <NotificationItem
                  key={Number(notification.id)}
                  notification={notification}
                  onRead={refetch}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationItem({ notification, onRead }: { notification: any; onRead: () => void }) {
  const router = useRouter();
  const { writeContract } = useWriteContract();
  
  const { data: actorProfile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [notification.actor as `0x${string}`],
  });

  const notifType = Number(notification.notifType);
  const isRead = notification.isRead;

  const handleClick = () => {
    if (!isRead) {
      writeContract({
        address: SOCIAL_MEDIA_CONTRACT.address,
        abi: SOCIAL_MEDIA_CONTRACT.abi,
        functionName: 'markNotificationRead',
        args: [notification.id],
      });
      setTimeout(() => onRead(), 1000);
    }

    if (Number(notification.postId) > 0) {
      router.push(`/post/${notification.postId}`);
    } else if (notifType === 2) { // FOLLOW
      router.push(`/profile/${notification.actor}`);
    }
  };

  const getNotificationContent = () => {
    const username = actorProfile?.username || `user_${notification.actor.slice(-4)}`;

    switch (notifType) {
      case 0: // LIKE
        return {
          icon: Heart,
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          text: `${username} liked your post`,
        };
      case 1: // COMMENT
        return {
          icon: MessageCircle,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          text: `${username} commented on your post`,
        };
      case 2: // FOLLOW
        return {
          icon: UserPlus,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          text: `${username} started following you`,
        };
      case 3: // MENTION
        return {
          icon: AtSign,
          color: 'text-purple-500',
          bgColor: 'bg-purple-100 dark:bg-purple-900/20',
          text: `${username} mentioned you in a post`,
        };
      case 4: // QUOTE
        return {
          icon: Quote,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          text: `${username} quoted your post`,
        };
      case 5: // SHARE
        return {
          icon: Share,
          color: 'text-cyan-500',
          bgColor: 'bg-cyan-100 dark:bg-cyan-900/20',
          text: `${username} shared your post`,
        };
      default:
        return {
          icon: Heart,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          text: `${username} interacted with your post`,
        };
    }
  };

  const content = getNotificationContent();
  const Icon = content.icon;

  return (
    <div
      onClick={handleClick}
      className={`px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 cursor-pointer transition ${
        !isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${content.bgColor} ${content.color} flex-shrink-0`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {notification.actor.slice(2, 4).toUpperCase()}
            </div>
            <p className="text-gray-900 dark:text-white flex-1">
              {content.text}
            </p>
            {!isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-10">
            {formatDistanceToNow(new Date(Number(notification.timestamp) * 1000), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}