'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { uploadToIPFS } from '@/lib/ipfs';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Loader2, Image as ImageIcon, Smile, MapPin, BarChart3 } from 'lucide-react';

export default function CreatePost() {
  const [content, setContent] = useState('');
  const { address } = useAccount();

  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handlePost = async () => {
    if (!content.trim()) return;

    try {
      const hash = await uploadToIPFS(content);

      writeContract({
        address: SOCIAL_MEDIA_CONTRACT.address,
        abi: SOCIAL_MEDIA_CONTRACT.abi,
        functionName: 'createPost',
        args: [hash],
      });
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  if (isSuccess) {
    setTimeout(() => {
      setContent('');
      window.location.reload();
    }, 1000);
  }

  const isLoading = isPending || isConfirming;

  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
          {address?.slice(2, 4).toUpperCase()}
        </div>

        {/* Input Area */}
        <div className="flex-1">
          <textarea
            placeholder="What's happening?!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xl text-gray-900 dark:text-white bg-transparent border-none outline-none resize-none placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px]"
            disabled={isLoading}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
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

            <button
              onClick={handlePost}
              disabled={isLoading || !content.trim()}
              className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 min-w-[80px] justify-center"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'Post'
              )}
            </button>
          </div>

          {isSuccess && (
            <div className="mt-3 text-sm text-green-600 dark:text-green-400">
              ✅ Your post has been published!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}