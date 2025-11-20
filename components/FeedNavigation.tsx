'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ConnectWallet from './ConnectWallet';
import ThemeToggle from './ThemeToggle';
import { Home, Search, Bell, User, Settings, MoreHorizontal } from 'lucide-react';

export default function FeedNavigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: Home, href: '/feed' },
    { name: 'Explore', icon: Search, href: '/explore' },
    { name: 'Notifications', icon: Bell, href: '/notifications' },
    { name: 'Profile', icon: User, href: '/profile' },
  ];

  return (
    <div className="flex flex-col h-screen py-1 px-2">
      {/* Logo */}
      <div className="flex items-center justify-center xl:justify-start px-3 h-14 mb-1">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">W3</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-full transition-colors mb-1 ${
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
        <button className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors mb-1 w-full">
          <MoreHorizontal size={26} />
          <span className="hidden xl:block text-xl">More</span>
        </button>
      </nav>

      {/* Post Button */}
      <button className="bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors mb-3 w-full xl:w-auto py-3 px-6">
        <span className="hidden xl:block">Post</span>
        <span className="xl:hidden text-2xl">+</span>
      </button>

      {/* User Menu */}
      <div className="mb-4">
        <div className="hidden xl:block">
          <ConnectWallet />
        </div>
        <div className="xl:hidden flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}