'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Image as ImageIcon, Smile, MapPin, BarChart3 } from 'lucide-react';
import CreatePostModal from './CreatePostModal';

export default function CreatePost() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address } = useAccount();

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/30 transition" onClick={() => setIsModalOpen(true)}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            {address?.slice(2, 4).toUpperCase()}
          </div>

          {/* Input Area */}
          <div className="flex-1">
            <div className="w-full text-xl text-gray-500 dark:text-gray-400 py-3">
              What's happening?!
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-1">
                <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition">
                  <ImageIcon size={20} />
                </button>
                <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition">
                  <BarChart3 size={20} />
                </button>
                <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition">
                  <Smile size={20} />
                </button>
                <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition">
                  <MapPin size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}