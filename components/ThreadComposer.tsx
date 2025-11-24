'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { uploadToIPFS } from '@/lib/ipfs';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { X, Loader2, Plus, Link2 } from 'lucide-react';

interface ThreadComposerProps {
  isOpen: boolean;
  onClose: () => void;
  existingThreadId?: number; // If continuing existing thread
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
      // Publish each post in sequence
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        if (!post.content.trim()) continue;

        const postContent = post.imageUrl.trim()
          ? `${post.content}\n\n[IMAGE]${post.imageUrl}[/IMAGE]`
          : post.content;

        const hash = await uploadToIPFS(postContent);

        const threadId = i === 0 ? (existingThreadId || 0) : i; // Continue thread after first post

        writeContract({
          address: SOCIAL_MEDIA_CONTRACT.address,
          abi: SOCIAL_MEDIA_CONTRACT.abi,
          functionName: 'createThreadPost',
          args: [hash, BigInt(threadId), 0n, []],
        });

        // Wait a bit between posts
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('Error publishing thread:', error);
      alert('Failed to publish thread');
    }
  };

  if (!isOpen) return null;

  const isLoading = isPending || isConfirming;
  const allPostsValid = posts.every(p => p.content.trim());

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-[700px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Link2 size={24} className="text-blue-500" />
              {existingThreadId ? 'Continue Thread' : 'Create Thread'}
            </h2>
          </div>
          <button
            onClick={publishThread}
            disabled={isLoading || !allPostsValid}
            className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Publish Thread'}
          </button>
        </div>

        {/* Thread Steps */}
        <div className="flex gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                currentStep === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              Post {index + 1}
            </button>
          ))}
          <button
            onClick={addPost}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {/* Current Post Editor */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {address?.slice(2, 4).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Post {currentStep + 1} of {posts.length}
              </div>

              <textarea
                value={posts[currentStep].content}
                onChange={(e) => updatePost(currentStep, 'content', e.target.value)}
                placeholder="What's happening?"
                className="w-full min-h-[150px] p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                disabled={isLoading}
              />

              <input
                type="text"
                value={posts[currentStep].imageUrl}
                onChange={(e) => updatePost(currentStep, 'imageUrl', e.target.value)}
                placeholder="Image URL (optional)"
                className="w-full mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                disabled={isLoading}
              />

              {posts.length > 1 && (
                <button
                  onClick={() => removePost(currentStep)}
                  className="mt-3 text-red-500 text-sm hover:underline"
                >
                  Remove this post
                </button>
              )}

              {/* Preview line to next post */}
              {currentStep < posts.length - 1 && (
                <div className="mt-4 flex items-center gap-2 text-gray-400">
                  <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-700"></div>
                  <span className="text-sm">Continues to post {currentStep + 2}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-600 dark:text-gray-400">
              {posts.length} posts in thread • {posts.filter(p => p.content.trim()).length} ready
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(posts.length - 1, currentStep + 1))}
                disabled={currentStep === posts.length - 1}
                className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {isSuccess && (
          <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-center">
            ✅ Thread published successfully!
          </div>
        )}
      </div>
    </div>
  );
}