'use client';

import { useState } from 'react';
import { Skeleton } from './Skeletons';
import { AlertCircle } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  aspectRatio = 'auto',
  quality = 75,
  priority = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  };

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  if (error) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-center ${aspectRatioClasses[aspectRatio]} ${className}`}
      >
        <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-gray-400 text-xs">Failed to load</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]}`}>
      {loading && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`${className} ${
          loading ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-300 object-cover`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
}

// Specialized component for avatar images
export function AvatarImage({
  src,
  alt,
  size = 'md',
  className = '',
}: {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  if (error || !src) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ${className}`}
      >
        {alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
}

// Component for post images with zoom capability
export function PostImage({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <span className="text-gray-400 text-sm">Image not available</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {loading && (
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`w-full max-h-[600px] object-cover ${
          loading ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
}

// Image gallery component for multiple images
export function ImageGallery({ images }: { images: Array<{ src: string; alt: string }> }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return <PostImage src={images[0].src} alt={images[0].alt} />;
  }

  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2',
    4: 'grid-cols-2',
  }[images.length] || 'grid-cols-2';

  return (
    <>
      <div className={`grid ${gridClasses} gap-1 rounded-xl overflow-hidden`}>
        {images.slice(0, 4).map((image, index) => (
          <div
            key={index}
            className="relative aspect-square cursor-pointer hover:opacity-90 transition"
            onClick={() => setSelectedIndex(index)}
          >
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              aspectRatio="square"
            />
            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">+{images.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={() => setSelectedIndex(null)}
          >
            ✕
          </button>
          <img
            src={images[selectedIndex].src}
            alt={images[selectedIndex].alt}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}