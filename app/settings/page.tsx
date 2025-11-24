'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FeedNavigation from '@/components/FeedNavigation';
import { Settings, User, Bell, Lock, Palette, Globe, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) return null;

  const settingsSections = [
    {
      title: 'Account',
      icon: User,
      items: [
        { name: 'Profile Settings', description: 'Update your username and bio' },
        { name: 'Connected Wallet', description: 'Manage your Web3 wallet' },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { name: 'Push Notifications', description: 'Get notified about new activity' },
        { name: 'Email Notifications', description: 'Receive updates via email' },
      ],
    },
    {
      title: 'Privacy & Safety',
      icon: Shield,
      items: [
        { name: 'Blocked Accounts', description: 'Manage blocked users' },
        { name: 'Privacy Settings', description: 'Control who can see your content' },
      ],
    },
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        { name: 'Theme', description: 'Choose between light and dark mode' },
        { name: 'Display Settings', description: 'Customize your feed layout' },
      ],
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings size={24} />
              Settings
            </h1>
          </div>

          {/* Settings Content */}
          <div className="p-4 max-w-2xl mx-auto space-y-6">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Icon size={20} />
                      {section.title}
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {section.items.map((item) => (
                      <button
                        key={item.name}
                        className="w-full px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition text-left"
                      >
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </div>
                      </button>
                    ))}
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