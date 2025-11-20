'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { X, Loader2 } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    username: string;
    bio: string;
    avatarHash: string;
  };
}

export default function EditProfileModal({ isOpen, onClose, currentProfile }: EditProfileModalProps) {
  const [username, setUsername] = useState(currentProfile.username);
  const [bio, setBio] = useState(currentProfile.bio);

  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSave = () => {
    writeContract({
      address: SOCIAL_MEDIA_CONTRACT.address,
      abi: SOCIAL_MEDIA_CONTRACT.abi,
      functionName: 'updateProfile',
      args: [username, bio, ''], // Empty avatar hash for now
    });
  };

  if (isSuccess) {
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 1000);
  }

  if (!isOpen) return null;

  const isLoading = isPending || isConfirming;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Tell us about yourself"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !username.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isPending && 'Saving...'}
              {isConfirming && 'Confirming...'}
              {!isLoading && 'Save'}
            </button>
          </div>

          {isSuccess && (
            <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm">
              ✅ Profile updated successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}