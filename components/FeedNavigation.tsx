'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useDisconnect, useReadContract } from 'wagmi';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import CreatePostModal from './CreatePostModal';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { 
  Home, 
  Search, 
  Bell, 
  User, 
  Wallet, 
  Bookmark,
  MessageCircle,
  Users,
  Settings,
  MoreHorizontal, 
  LogOut, 
  Link2, 
  Plus 
} from 'lucide-react';

interface FeedNavigationProps {
  onThreadClick?: () => void;
}

export default function FeedNavigation({ onThreadClick }: FeedNavigationProps) {
  const pathname = usePathname();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Get unread notification count
  const { data: unreadCount } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getUnreadNotificationCount',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  // Get user profile
  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  const navItems = [
    { name: 'Home', icon: Home, href: '/feed', badge: null },
    { name: 'Explore', icon: Search, href: '/explore', badge: null },
    { 
      name: 'Notifications', 
      icon: Bell, 
      href: '/notifications', 
      badge: unreadCount && Number(unreadCount) > 0 ? Number(unreadCount) : null 
    },
    { name: 'Messages', icon: MessageCircle, href: '/messages', badge: null },
    { name: 'Bookmarks', icon: Bookmark, href: '/bookmarks', badge: null },
    { name: 'Communities', icon: Users, href: '/communities', badge: null },
    { name: 'Profile', icon: User, href: '/profile', badge: null },
    { name: 'Wallet', icon: Wallet, href: '/wallet', badge: null },
  ];

  const username = profile?.username || `user_${address?.slice(-4)}`;
  const unread = unreadCount ? Number(unreadCount) : 0;

  return (
    <>
      <div className="flex flex-col h-full py-1 px-2 overflow-hidden">
        {/* Logo */}
        <div className="flex items-center justify-center xl:justify-start px-3 h-14 mb-1 flex-shrink-0">
          <Link href="/feed" className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:opacity-90 transition shadow-lg">
            <span className="text-white font-bold text-xl">W3</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between gap-4 px-4 py-3 rounded-full transition-all mb-1 group relative ${
                  isActive
                    ? 'font-bold bg-blue-50 dark:bg-blue-900/20'
                    : 'font-normal hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Icon 
                      size={26} 
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}
                    />
                    {item.badge && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {item.badge > 99 ? '99+' : item.badge}
                      </div>
                    )}
                  </div>
                  <span className={`hidden xl:block text-xl ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                    {item.name}
                  </span>
                </div>
                {item.badge && (
                  <div className="hidden xl:flex bg-blue-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] items-center justify-center px-2">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </Link>
            );
          })}

          {/* More */}
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors mb-1 w-full text-gray-900 dark:text-white relative"
          >
            <MoreHorizontal size={26} />
            <span className="hidden xl:block text-xl">More</span>
            
            {showMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                <Link
                  href="/settings"
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left"
                >
                  <Settings size={20} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Settings</span>
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    disconnect();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left"
                >
                  <LogOut size={20} className="text-red-600" />
                  <span className="text-gray-900 dark:text-white font-semibold">Disconnect</span>
                </button>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            )}
          </button>
        </nav>

        {/* Post & Thread Buttons */}
        <div className="flex-shrink-0 mb-3 space-y-2">
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-all w-full py-3 px-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus size={20} className="xl:hidden" />
            <span className="hidden xl:block">Post</span>
          </button>

          {onThreadClick && (
            <button
              onClick={onThreadClick}
              className="bg-purple-500 text-white rounded-full font-bold hover:bg-purple-600 transition-all w-full py-3 px-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Link2 size={20} />
              <span className="hidden xl:block">Thread</span>
            </button>
          )}
        </div>

        {/* User Profile Card */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mb-2 flex-shrink-0">
          <Link href="/profile">
            <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition cursor-pointer group">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 group-hover:scale-110 transition">
                  {address?.slice(2, 4).toUpperCase()}
                </div>
                <div className="hidden xl:block min-w-0 flex-1">
                  <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {username}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                </div>
              </div>
              <MoreHorizontal size={18} className="hidden xl:block text-gray-500 dark:text-gray-400" />
            </div>
          </Link>
        </div>
      </div>

      <CreatePostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
    </>
  );
}