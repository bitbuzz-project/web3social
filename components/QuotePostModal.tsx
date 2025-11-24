'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { uploadToIPFS } from '@/lib/ipfs';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { X, Loader2 } from 'lucide-react';
import { getFromIPFS, extractImageFromContent } from '@/lib/ipfs';
import TextWithHashtags from './TextWithHashtags';

interface QuotePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotedPostId: number;
}

export default function QuotePostModal({ isOpen, onClose, quotedPostId }: QuotePostModalProps) {
  const [content, setContent] = useState('');
  const { address } = useAccount();
  const [quotedContent, setQuotedContent] = useState('Loading...');

  const { data: hash, writeContract, isPending, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: quotedPost } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getPost',
    args: [BigInt(quotedPostId)],
  });

  const { data: quotedProfile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: quotedPost?.author as `0x${string}`,
    query: { enabled: !!quotedPost?.author },
  });

  useEffect(() => {
    if (quotedPost?.contentHash) {
      getFromIPFS(quotedPost.contentHash).then(text => {
        const { text: postText } = extractImageFromContent(text);
        setQuotedContent(postText);
      }).catch(() => setQuotedContent('Failed to load'));
    }
  }, [quotedPost?.contentHash]);

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        setContent('');
        reset();
        onClose();
        window.location.reload();
      }, 1500);
    }
  }, [isSuccess, onClose, reset]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePost = async () => {
    if (!content.trim()) return;

    try {
      const hash = await uploadToIPFS(content);

      writeContract({
        address: SOCIAL_MEDIA_CONTRACT.address,
        abi: SOCIAL_MEDIA_CONTRACT.abi,
        functionName: 'createPost',
        args: [hash, BigInt(quotedPostId), []],
      });
    } catch (error) {
      console.error('Error creating quote post:', error);
      alert('Failed to create quote post');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setContent('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLoading = isPending || isConfirming;
  const quotedUsername = quotedProfile?.username || `user_${quotedPost?.author?.slice(-4)}`;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-[10vh]"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-gray-500/20 dark:bg-gray-900/80 backdrop-blur-sm" />
      
      <div 
        className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-[600px] shadow-2xl border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <X size={20} className="text-gray-900 dark:text-white" />
          </button>
          <button
            onClick={handlePost}
            disabled={isLoading || !content.trim()}
            className="bg-blue-500 text-white px-6 py-1.5 rounded-full font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 min-w-[80px] justify-center"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              'Post'
            )}
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {address?.slice(2, 4).toUpperCase()}
            </div>

            <div className="flex-1">
              <textarea
                placeholder="Add a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-xl text-gray-900 dark:text-white bg-transparent border-none outline-none resize-none placeholder-gray-500 dark:placeholder-gray-400 min-h-[100px]"
                disabled={isLoading}
                autoFocus
              />

              {/* Quoted Post */}
              <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {quotedPost?.author?.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {quotedUsername}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                      {quotedPost?.author?.slice(0, 6)}...{quotedPost?.author?.slice(-4)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-900 dark:text-white line-clamp-3">
                  <TextWithHashtags text={quotedContent} />
                </div>
              </div>

              {isSuccess && (
                <div className="mt-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  ✅ Quote posted successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}