'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Hash } from 'lucide-react';

interface HashtagData {
  tag: string;
  count: number;
}

export default function TrendingHashtags() {
  const [trending, setTrending] = useState<HashtagData[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Get hashtags from localStorage
    const stored = localStorage.getItem('hashtag_tracker');
    if (stored) {
      const data = JSON.parse(stored);
      const sorted = Object.entries(data)
        .map(([tag, count]) => ({ tag, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTrending(sorted);
    }
  }, []);

  const handleHashtagClick = (tag: string) => {
    router.push(`/hashtag/${encodeURIComponent(tag)}`);
  };

  if (trending.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" />
          Trending Hashtags
        </h2>
      </div>
      <div>
        {trending.map((item, i) => (
          <div
            key={item.tag}
            onClick={() => handleHashtagClick(item.tag)}
            className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition border-b border-gray-200 dark:border-gray-800 last:border-0"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  #{i + 1} Trending
                </div>
                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  <Hash size={16} />
                  {item.tag}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {item.count} posts
                </div>
              </div>
              <TrendingUp size={20} className="text-blue-500 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
      <button 
        onClick={() => router.push('/explore')}
        className="px-4 py-3 text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm font-semibold"
      >
        Show more
      </button>
    </div>
  );
}