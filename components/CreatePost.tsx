'use client';

import { useState } from 'react';
import { uploadToIPFS } from '@/lib/ipfs';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Loader2, Image as ImageIcon } from 'lucide-react';

export default function CreatePost() {
  const [content, setContent] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');

  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handlePost = async () => {
    if (!content.trim()) return;

    try {
      const hash = await uploadToIPFS(content);
      setIpfsHash(hash);

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
      setIpfsHash('');
      window.location.reload();
    }, 1000);
  }

  const isLoading = isPending || isConfirming;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        disabled={isLoading}
      />
      <div className="flex justify-between items-center mt-3">
        <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <ImageIcon size={20} />
        </button>
        <button
          onClick={handlePost}
          disabled={isLoading || !content.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {isPending && 'Uploading...'}
          {isConfirming && 'Confirming...'}
          {!isLoading && 'Post'}
        </button>
      </div>
      {isSuccess && (
        <div className="mt-3 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm">
          ✅ Post created successfully!
        </div>
      )}
    </div>
  );
}