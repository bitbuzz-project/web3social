'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { uploadToIPFS } from '@/lib/ipfs';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { X, Loader2, Image as ImageIcon, Smile, MapPin, BarChart3 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useToast } from './ToastProvider';
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { address } = useAccount();
  const toast = useToast();
  const { data: hash, writeContract, isPending, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

useEffect(() => {
  if (isSuccess) {
    toast.success('Post published successfully!');
    setTimeout(() => {
      setContent('');
      setImageUrl('');
      setImagePreview('');
      setShowEmojiPicker(false);
      reset();
      onClose();
      window.location.reload();
    }, 1500);
  }
}, [isSuccess, onClose, reset, toast]);

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

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    if (url.trim()) {
      setImagePreview(url);
    } else {
      setImagePreview('');
    }
  };

  // Detect mentions in the content (@0x...)
  const detectMentions = (text: string): string[] => {
    const mentionRegex = /@(0x[a-fA-F0-9]{40})/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(m => m.substring(1)) : [];
  };

  const handlePost = async () => {
    if (!content.trim() && !imageUrl.trim()) {
      toast.error('Please enter some content or add an image');
      return;
    }

    try {
      const postContent = imageUrl.trim() 
        ? `${content}\n\n[IMAGE]${imageUrl}[/IMAGE]`
        : content;
      
      const hash = await uploadToIPFS(postContent);
      const mentions = detectMentions(content);

      writeContract({
        address: SOCIAL_MEDIA_CONTRACT.address,
        abi: SOCIAL_MEDIA_CONTRACT.abi,
        functionName: 'createPost',
        args: [hash, 0n, mentions as `0x${string}`[]],
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setContent('');
      setImageUrl('');
      setImagePreview('');
      setShowEmojiPicker(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLoading = isPending || isConfirming;

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
            disabled={isLoading || (!content.trim() && !imageUrl.trim())}
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
                placeholder="What's happening?!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-xl text-gray-900 dark:text-white bg-transparent border-none outline-none resize-none placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px]"
                disabled={isLoading}
                autoFocus
              />

              {/* Mention hint */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                💡 Mention users with @0xAddress
              </div>

              {/* Image URL Input */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Add image URL (optional)"
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mb-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full max-h-[300px] object-cover"
                    onError={() => setImagePreview('')}
                  />
                  <button
                    onClick={() => {
                      setImageUrl('');
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-gray-900/80 hover:bg-gray-900 rounded-full transition"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex gap-1">
                  <button 
                    onClick={() => document.getElementById('imageUrlInput')?.focus()}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition">
                    <BarChart3 size={20} />
                  </button>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition relative"
                  >
                    <Smile size={20} />
                  </button>
                  <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition">
                    <MapPin size={20} />
                  </button>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {content.length} characters
                </div>
              </div>

              {showEmojiPicker && (
                <div className="mt-3">
                  <EmojiPicker
                    onEmojiClick={(emoji) => {
                      setContent(content + emoji.emoji);
                      setShowEmojiPicker(false);
                    }}
                    width="100%"
                    height="350px"
                  />
                </div>
              )}

              {isSuccess && (
                <div className="mt-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  ✅ Your post has been published!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}