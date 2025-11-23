'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import CreatePostModal from './CreatePostModal';
import { Home, Search, Bell, User, Wallet, MoreHorizontal, LogOut } from 'lucide-react';

export default function FeedNavigation() {
  const pathname = usePathname();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors mb-1 w-full text-gray-900 dark:text-white relative"
          >
            <MoreHorizontal size={26} />
            <span className="hidden xl:block text-xl">More</span>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    disconnect();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left"
                >
                  <LogOut size={20} className="text-red-600" />
                  <span className="text-gray-900 dark:text-white font-semibold">Disconnect Wallet</span>
                </button>
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Toggle Theme</span>
                  </div>
                </div>
              </div>
            )}
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
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {address?.slice(2, 4).toUpperCase()}
              </div>
              <div className="hidden xl:block min-w-0 flex-1">
                <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Connected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreatePostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
    </>
  );
}