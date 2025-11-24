'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { uploadToIPFS } from '@/lib/ipfs';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { X, Loader2, Plus } from 'lucide-react';

interface ThreadComposerProps {
  isOpen: boolean;
  onClose: () => void;
  existingThreadId?: number;
}

interface ThreadPost {
  content: string;
  imageUrl: string;
}

export default function ThreadComposer({ isOpen, onClose, existingThreadId }: ThreadComposerProps) {
  const [posts, setPosts] = useState<ThreadPost[]>([{ content: '', imageUrl: '' }]);
  const [currentStep, setCurrentStep] = useState(0);
  const { address } = useAccount();

  const { data: hash, writeContract, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        setPosts([{ content: '', imageUrl: '' }]);
        setCurrentStep(0);
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

  const addPost = () => {
    setPosts([...posts, { content: '', imageUrl: '' }]);
    setCurrentStep(posts.length);
  };

  const updatePost = (index: number, field: 'content' | 'imageUrl', value: string) => {
    const newPosts = [...posts];
    newPosts[index][field] = value;
    setPosts(newPosts);
  };

  const removePost = (index: number) => {
    if (posts.length > 1) {
      const newPosts = posts.filter((_, i) => i !== index);
      setPosts(newPosts);
      if (currentStep >= newPosts.length) {
        setCurrentStep(newPosts.length - 1);
      }
    }
  };

  const publishThread = async () => {
    try {
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        if (!post.content.trim()) continue;

        const postContent = post.imageUrl.trim()
          ? `${post.content}\n\n[IMAGE]${post.imageUrl}[/IMAGE]`
          : post.content;

        const hash = await uploadToIPFS(postContent);
        const threadId = i === 0 ? (existingThreadId || 0) : i;

        writeContract({
          address: SOCIAL_MEDIA_CONTRACT.address,
          abi: SOCIAL_MEDIA_CONTRACT.abi,
          functionName: 'createThreadPost',
          args: [hash, BigInt(threadId), 0n, []],
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('Error publishing thread:', error);
      alert('Failed to publish thread');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPosts([{ content: '', imageUrl: '' }]);
      setCurrentStep(0);
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLoading = isPending || isConfirming;
  const allPostsValid = posts.every(p => p.content.trim());

  return (
    <>
      {/* Backdrop - separate layer */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998]"
        onClick={handleClose}
      />
      
      {/* Modal - on top */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-[600px] shadow-2xl border border-gray-200 dark:border-gray-800 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition"
            >
              <X size={20} className="text-gray-900 dark:text-white" />
            </button>
            <button
              onClick={publishThread}
              disabled={isLoading || !allPostsValid}
              className="bg-blue-500 text-white px-6 py-1.5 rounded-full font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 min-w-[100px] justify-center"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'Publish Thread'
              )}
            </button>
          </div>

          {/* Thread Steps */}
          <div className="flex gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
            {posts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                  currentStep === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Post {index + 1}
              </button>
            ))}
            <button
              onClick={addPost}
              disabled={isLoading}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1 transition disabled:opacity-50"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {address?.slice(2, 4).toUpperCase()}
              </div>

              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Post {currentStep + 1} of {posts.length}
                </div>

                <textarea
                  value={posts[currentStep].content}
                  onChange={(e) => updatePost(currentStep, 'content', e.target.value)}
                  placeholder="What's happening?!"
                  className="w-full text-xl text-gray-900 dark:text-white bg-transparent border-none outline-none resize-none placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px] mb-3"
                  disabled={isLoading}
                  autoFocus
                />

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  💡 Mention users with @0xAddress
                </div>

                <input
                  type="text"
                  placeholder="Add image URL (optional)"
                  value={posts[currentStep].imageUrl}
                  onChange={(e) => updatePost(currentStep, 'imageUrl', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  disabled={isLoading}
                />

                {posts.length > 1 && (
                  <button
                    onClick={() => removePost(currentStep)}
                    disabled={isLoading}
                    className="text-red-500 text-sm hover:underline mb-3 disabled:opacity-50"
                  >
                    Remove this post
                  </button>
                )}

                {currentStep < posts.length - 1 && (
                  <div className="mt-4 flex items-center gap-2 text-gray-400">
                    <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-700"></div>
                    <span className="text-sm">Continues to post {currentStep + 2}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {posts[currentStep].content.length} characters
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0 || isLoading}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentStep(Math.min(posts.length - 1, currentStep + 1))}
                      disabled={currentStep === posts.length - 1 || isLoading}
                      className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {isSuccess && (
                  <div className="mt-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                    ✅ Thread published successfully!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}