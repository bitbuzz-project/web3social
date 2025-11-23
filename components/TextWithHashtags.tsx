'use client';

import { useRouter } from 'next/navigation';

interface TextWithHashtagsProps {
  text: string;
}

export default function TextWithHashtags({ text }: TextWithHashtagsProps) {
  const router = useRouter();
  const parts = text.split(/(#[\w\u0600-\u06FF]+)/g);
  
  const handleHashtagClick = (hashtag: string) => {
    // You can navigate to a search page or filter posts by hashtag
    router.push(`/explore?q=${encodeURIComponent(hashtag)}`);
  };
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('#')) {
          return (
            <span 
              key={index} 
              onClick={(e) => {
                e.stopPropagation();
                handleHashtagClick(part);
              }}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}