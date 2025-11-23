'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import CreatePostModal from './CreatePostModal';
import { Home, Search, Bell, User, Wallet, MoreHorizontal } from 'lucide-react';

export default function FeedNavigation() {
  const pathname = usePathname();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const navItems = [
    { name: 'Home', icon: Home, href: '/feed' },
    { name: 'Explore', icon: Search, href: '/explore' },
    { name: 'Notifications', icon: Bell, href: '/notifications' },
    { name: 'Profile', icon: User, href: '/profile' },
    { name: 'Wallet', icon: Wallet, href: '/wallet' },
  ];

  return (
    <>
      <div className="flex flex-col h-full py-1 px-2 overflow-hidden">
        {/* Logo */}
        <div className="flex items-center justify-center xl:justify-start px-3 h-14 mb-1 flex-shrink-0">
          <Link href="/feed" className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition">
            <span className="text-white font-bold text-xl">W3</span>
          </Link>
        </div>

        {/* Navigation Items - Scrollable if needed */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-full transition-colors mb-1 text-gray-900 dark:text-white ${
                  isActive
                    ? 'font-bold'
                    : 'font-normal hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
              >
                <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                <span className="hidden xl:block text-xl">{item.name}</span>
              </Link>
            );
          })}

          {/* More */}
          <button className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors mb-1 w-full text-gray-900 dark:text-white">
            <MoreHorizontal size={26} />
            <span className="hidden xl:block text-xl">More</span>
          </button>
        </nav>

        {/* Post Button */}
        <div className="flex-shrink-0 mb-3">
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors w-full xl:w-auto py-3 px-6"
          >
            <span className="hidden xl:block">Post</span>
            <span className="xl:hidden text-2xl">+</span>
          </button>
        </div>

        {/* User Profile Card */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mb-2 flex-shrink-0">
          <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition cursor-pointer">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {address?.slice(2, 4).toUpperCase()}
              </div>
              <div className="hidden xl:block min-w-0">
                <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Connected</div>
              </div>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <button
                onClick={() => disconnect()}
                className="xl:hidden p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                title="Disconnect"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 11-2 0V4H5v12h10v-2a1 1 0 112 0v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3z"/>
                  <path d="M11 10a1 1 0 011-1h5.586l-1.293-1.293a1 1 0 011.414-1.414l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L17.586 11H12a1 1 0 01-1-1z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreatePostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
    </>
  );
}