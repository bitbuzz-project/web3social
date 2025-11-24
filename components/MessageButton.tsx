'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

interface MessageButtonProps {
  userAddress: string;
}

export default function MessageButton({ userAddress }: MessageButtonProps) {
  const router = useRouter();

  const handleMessage = () => {
    // Navigate to messages page with the user address as query param
    router.push(`/messages?user=${userAddress}`);
  };

  return (
    <button
      onClick={handleMessage}
      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-900 transition"
    >
      <MessageCircle size={18} />
      <span>Message</span>
    </button>
  );
}