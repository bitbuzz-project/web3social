'use client';

import { useState } from 'react';
import { Menu, X, Settings, LogOut, Wallet, Bookmark, Users, BarChart3 } from 'lucide-react';
import { useDisconnect, useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { disconnect, address } = useDisconnect();
  const router = useRouter();

  const menuItems = [
    { icon: Wallet, label: 'Wallet', href: '/wallet' },
    { icon: Bookmark, label: 'Bookmarks', href: '/bookmarks' },
    { icon: Users, label: 'Communities', href: '/communities' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition"
        aria-label="Open menu"
      >
        <Menu size={24} className="text-gray-900 dark:text-white" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800 z-[999] transform transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition"
              aria-label="Close menu"
            >
              <X size={24} className="text-gray-900 dark:text-white" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg text-left transition text-gray-900 dark:text-white"
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              <div className="border-t border-gray-200 dark:border-gray-800 my-4"></div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-3">
                <span className="flex items-center gap-3 text-gray-900 dark:text-white">
                  <span className="font-medium">Dark Mode</span>
                </span>
                <ThemeToggle />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 my-4"></div>

              {/* Disconnect */}
              <button
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left transition text-red-600 dark:text-red-400"
              >
                <LogOut size={20} />
                <span className="font-medium">Disconnect Wallet</span>
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {address && (
                <div className="font-mono mb-2">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              )}
              <div>Web3Social v1.0</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}