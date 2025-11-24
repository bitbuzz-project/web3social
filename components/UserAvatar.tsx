'use client';

import { useReadContract } from 'wagmi';
import { useState, useEffect } from 'react';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';
import { CheckCircle2 } from 'lucide-react';

interface UserAvatarProps {
  address: `0x${string}`;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showVerified?: boolean;
  className?: string;
}

const ERC721_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default function UserAvatar({ 
  address, 
  size = 'md', 
  showVerified = true,
  className = '' 
}: UserAvatarProps) {
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(null);
  const [loadingNft, setLoadingNft] = useState(false);

  // Get user profile from contract
  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [address],
  });

  // Get NFT tokenURI if user has NFT avatar
  const { data: tokenURI } = useReadContract({
    address: profile?.nftContract as `0x${string}`,
    abi: ERC721_ABI,
    functionName: 'tokenURI',
    args: profile?.nftTokenId !== undefined ? [profile.nftTokenId] : undefined,
    query: {
      enabled: !!profile?.nftContract && profile?.nftContract !== '0x0000000000000000000000000000000000000000',
    },
  });

  // Fetch NFT metadata when tokenURI is available
  useEffect(() => {
    if (tokenURI) {
      setLoadingNft(true);
      const uri = tokenURI as string;
      
      // Handle data URI (base64)
      if (uri.startsWith('data:')) {
        try {
          const base64Data = uri.split(',')[1];
          const jsonData = JSON.parse(atob(base64Data));
          const imageUrl = jsonData.image;
          
          // Handle data URI image
          if (imageUrl.startsWith('data:')) {
            setNftImageUrl(imageUrl);
          } else if (imageUrl.startsWith('ipfs://')) {
            setNftImageUrl(imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/'));
          } else {
            setNftImageUrl(imageUrl);
          }
          setLoadingNft(false);
        } catch (err) {
          console.error('Failed to parse NFT metadata:', err);
          setLoadingNft(false);
        }
      }
      // Handle IPFS
      else if (uri.startsWith('ipfs://')) {
        const ipfsUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
        fetch(ipfsUrl)
          .then((res) => res.json())
          .then((data) => {
            const imageUrl = data.image.startsWith('ipfs://') 
              ? data.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
              : data.image;
            setNftImageUrl(imageUrl);
            setLoadingNft(false);
          })
          .catch((err) => {
            console.error('Failed to fetch NFT metadata:', err);
            setLoadingNft(false);
          });
      }
      // Handle HTTP(S)
      else {
        fetch(uri)
          .then((res) => res.json())
          .then((data) => {
            const imageUrl = data.image.startsWith('ipfs://')
              ? data.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
              : data.image;
            setNftImageUrl(imageUrl);
            setLoadingNft(false);
          })
          .catch((err) => {
            console.error('Failed to fetch NFT metadata:', err);
            setLoadingNft(false);
          });
      }
    }
  }, [tokenURI]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const verifiedSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  // Determine what to display
  const hasNftAvatar = nftImageUrl && !loadingNft;
  const hasRegularAvatar = profile?.avatarHash && profile.avatarHash !== '';
  const isVerified = profile?.isVerified || hasNftAvatar;

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-gray-200 dark:border-gray-700`}
      >
        {loadingNft ? (
          // Loading NFT
          <div className="w-full h-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
        ) : hasNftAvatar ? (
          // NFT Avatar
          <img
            src={nftImageUrl}
            alt="NFT Avatar"
            className="w-full h-full object-cover"
          />
        ) : hasRegularAvatar ? (
          // Regular Avatar
          <img
            src={profile.avatarHash}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          // Default Avatar (first 2 chars of address)
          <span className="text-xs uppercase">
            {address.slice(2, 4)}
          </span>
        )}
      </div>

      {/* Verified Badge */}
      {showVerified && isVerified && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border-2 border-white dark:border-gray-900">
          <CheckCircle2 className={`${verifiedSizeClasses[size]} text-white`} />
        </div>
      )}
    </div>
  );
}