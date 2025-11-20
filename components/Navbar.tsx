'use client';

import Link from 'next/link';
import ConnectWallet from './ConnectWallet';
import ThemeToggle from './ThemeToggle';
import { Home, Search, Bell, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Web3Social
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/feed" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              <Home size={20} />
              <span className="hidden md:inline">Feed</span>
            </Link>
            <Link href="/explore" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              <Search size={20} />
              <span className="hidden md:inline">Explore</span>
            </Link>
            <Link href="/notifications" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              <Bell size={20} />
              <span className="hidden md:inline">Notifications</span>
            </Link>
            <Link href="/profile" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              <User size={20} />
              <span className="hidden md:inline">Profile</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
}