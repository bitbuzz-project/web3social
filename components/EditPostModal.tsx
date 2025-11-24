'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { uploadToIPFS, getFromIPFS, extractImageFromContent } from '@/lib/ipfs';
import { X, Loader2, Clock } from 'lucide-react';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  currentContentHash: string;
}

export default function EditPostModal({ isOpen, onClose, postId, currentContentHash }: EditPostModalProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: canEdit } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'canEditPost',
    args: [BigInt(postId), '0xYourAddress' as `0x${string}`], // Replace with actual user address
  });

  useEffect(() => {
    if (currentContentHash && isOpen) {
      setLoading(true);
      getFromIPFS(currentContentHash).then(text => {
        const { text: postText, imageUrl: img } = extractImageFromContent(text);
        setContent(postText);
        setImageUrl(img || '');
        setLoading(false);
      });
    }
  }, [currentContentHash, isOpen]);

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    }
  }, [isSuccess, onClose]);

  const handleSave = async () => {
    if (!content.trim()) return;

    try {
      const postContent = imageUrl.trim() 
        ? `${content}\n\n[IMAGE]${imageUrl}[/IMAGE]`
        : content;
      
      const hash = await uploadToIPFS(postContent);

      writeContract({
        address: SOCIAL_MEDIA_CONTRACT.address,
        abi: SOCIAL_MEDIA_CONTRACT.abi,
        functionName: 'editPost',
        args: [BigInt(postId), hash],
      });
    } catch (error) {
      console.error('Error editing post:', error);
      alert('Failed to edit post');
    }
  };

  if (!isOpen) return null;

  const isLoading = isPending || isConfirming || loading;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-[600px] shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {!canEdit ? (
            <div className="text-center py-8">
              <Clock size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                Edit time expired (24 hours limit)
              </p>
            </div>
          ) : (
            <>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[200px] p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="What's on your mind?"
                disabled={isLoading}
              />

              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL (optional)"
                className="w-full mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                disabled={isLoading}
              />

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ⚠️ You have 24 hours to edit after posting
                </div>
                <button
                  onClick={handleSave}
                  disabled={isLoading || !content.trim()}
                  className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>

              {isSuccess && (
                <div className="mt-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                  ✅ Post updated successfully!
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
