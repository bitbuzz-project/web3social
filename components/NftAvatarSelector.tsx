'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';

interface NftAvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

// ERC-721 ABI
const ERC721_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }, { name: 'index', type: 'uint256' }],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default function NftAvatarSelector({ isOpen, onClose }: NftAvatarSelectorProps) {
  const { address } = useAccount();
  const [selectedNft, setSelectedNft] = useState<{ contract: string; tokenId: string } | null>(null);
  const [nftContract, setNftContract] = useState('');
  const [error, setError] = useState('');

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Validate contract address
  const isValidAddress = (addr: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  // Read NFT balance
  const { data: balance, isError: balanceError } = useReadContract({
    address: nftContract as `0x${string}`,
    abi: ERC721_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!nftContract && !!address && isValidAddress(nftContract),
    },
  });

  // Debug logs
  useEffect(() => {
    console.log('=== NFT AVATAR DEBUG ===');
    console.log('NFT Contract:', nftContract);
    console.log('User Address:', address);
    console.log('Balance:', balance?.toString());
    console.log('Balance Error:', balanceError);
    console.log('Is Valid Address:', isValidAddress(nftContract));
  }, [nftContract, address, balance, balanceError]);

  const handleSetAvatar = () => {
    if (!selectedNft) return;

    console.log('Setting avatar:', selectedNft);
    writeContract({
      address: SOCIAL_MEDIA_CONTRACT.address,
      abi: SOCIAL_MEDIA_CONTRACT.abi,
      functionName: 'setNftAvatar',
      args: [selectedNft.contract as `0x${string}`, BigInt(selectedNft.tokenId)],
    });
  };

  const handleContractChange = (value: string) => {
    setNftContract(value);
    setError('');
    setSelectedNft(null);
    
    if (value && !isValidAddress(value)) {
      setError('Invalid contract address format');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    }
  }, [isSuccess, onClose]);

  if (!isOpen) return null;

  const nftCount = balance ? Number(balance) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose NFT Avatar</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> Enter a Base Sepolia NFT (ERC-721) contract address. You must own at least one NFT from the collection.
            </p>
          </div>

          {/* NFT Contract Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              NFT Contract Address (Base Sepolia)
            </label>
            <input
              type="text"
              value={nftContract}
              onChange={(e) => handleContractChange(e.target.value)}
              placeholder="0x..."
              className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                error 
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
              }`}
            />
            {error && (
              <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {balanceError && nftContract && (
              <div className="flex items-center gap-2 mt-2 text-orange-600 dark:text-orange-400 text-sm">
                <AlertCircle size={16} />
                <span>Could not read from this contract. Make sure it's an ERC-721 NFT on Base Sepolia.</span>
              </div>
            )}
          </div>

          {/* Debug Info */}
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
            <div>Contract: {nftContract || 'Not set'}</div>
            <div>Balance: {balance?.toString() || 'Loading...'}</div>
            <div>NFT Count: {nftCount}</div>
            <div>Valid Address: {isValidAddress(nftContract) ? 'Yes' : 'No'}</div>
          </div>

          {/* NFT Grid */}
          {nftContract && isValidAddress(nftContract) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Your NFTs {nftCount > 0 && `(${nftCount})`}
                </h3>
              </div>

              {nftCount > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: Math.min(nftCount, 9) }, (_, i) => {
                    console.log('Rendering NFT card', i);
                    return (
                      <NftCard
                        key={i}
                        contract={nftContract}
                        tokenIndex={i}
                        isSelected={selectedNft?.tokenId === i.toString()}
                        onSelect={(tokenId) => {
                          console.log('NFT selected:', tokenId);
                          setSelectedNft({ contract: nftContract, tokenId });
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>No NFTs found in this collection</p>
                  <p className="text-sm mt-2">Make sure you own NFTs from this contract</p>
                </div>
              )}
            </div>
          )}

          {!nftContract && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>Enter an NFT contract address to view your NFTs</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isPending || isConfirming}
            className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSetAvatar}
            disabled={!selectedNft || isPending || isConfirming}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {(isPending || isConfirming) && <Loader2 size={16} className="animate-spin" />}
            {isPending && 'Setting...'}
            {isConfirming && 'Confirming...'}
            {isSuccess && <><CheckCircle2 size={16} /> Set!</>}
            {!isPending && !isConfirming && !isSuccess && 'Set as Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function NftCard({
  contract,
  tokenIndex,
  isSelected,
  onSelect,
}: {
  contract: string;
  tokenIndex: number;
  isSelected: boolean;
  onSelect: (tokenId: string) => void;
}) {
  const { address } = useAccount();
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  console.log(`NftCard ${tokenIndex} rendering for contract:`, contract);

  const { data: tokenId, isError: tokenIdError } = useReadContract({
    address: contract as `0x${string}`,
    abi: ERC721_ABI,
    functionName: 'tokenOfOwnerByIndex',
    args: [address as `0x${string}`, BigInt(tokenIndex)],
  });

  const { data: tokenURI, isError: uriError } = useReadContract({
    address: contract as `0x${string}`,
    abi: ERC721_ABI,
    functionName: 'tokenURI',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });

  useEffect(() => {
    console.log(`NFT Card ${tokenIndex} data:`, {
      tokenId: tokenId?.toString(),
      tokenURI,
      tokenIdError,
      uriError
    });

    if (tokenURI) {
      const uri = tokenURI as string;
      console.log(`Processing URI for token ${tokenIndex}:`, uri);
      
      // Handle data URI (base64)
      if (uri.startsWith('data:')) {
        try {
          const base64Data = uri.split(',')[1];
          const jsonData = JSON.parse(atob(base64Data));
          console.log('Parsed metadata:', jsonData);
          setMetadata(jsonData);
          setLoading(false);
        } catch (err) {
          console.error('Failed to parse data URI:', err);
          setLoading(false);
        }
      } 
      // Handle IPFS
      else if (uri.startsWith('ipfs://')) {
        const ipfsUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
        console.log('Fetching IPFS:', ipfsUrl);
        fetch(ipfsUrl)
          .then((res) => res.json())
          .then((data) => {
            console.log('IPFS metadata:', data);
            setMetadata(data);
            setLoading(false);
          })
          .catch((err) => {
            console.error('IPFS fetch error:', err);
            setLoading(false);
          });
      }
      // Handle HTTP(S)
      else {
        console.log('Fetching HTTP:', uri);
        fetch(uri)
          .then((res) => res.json())
          .then((data) => {
            console.log('HTTP metadata:', data);
            setMetadata(data);
            setLoading(false);
          })
          .catch((err) => {
            console.error('HTTP fetch error:', err);
            setLoading(false);
          });
      }
    }
  }, [tokenURI, tokenIndex]);

  if (!tokenId) {
    console.log(`Token ${tokenIndex} - no tokenId yet`);
    return (
      <div className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  const getImageUrl = (image: string) => {
    if (image.startsWith('ipfs://')) {
      return image.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return image;
  };

  return (
    <div
      onClick={() => {
        console.log('Card clicked, tokenId:', tokenId.toString());
        onSelect(tokenId.toString());
      }}
      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-4 transition ${
        isSelected
          ? 'border-blue-500 shadow-lg scale-105'
          : 'border-gray-300 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:scale-105'
      }`}
    >
      {loading ? (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" size={24} />
          <div className="absolute bottom-2 text-xs text-gray-500">Loading...</div>
        </div>
      ) : metadata?.image && !imageError ? (
        <img
          src={getImageUrl(metadata.image)}
          alt={metadata.name || `NFT #${tokenId}`}
          className="w-full h-full object-cover"
          onError={() => {
            console.error('Image failed to load:', metadata.image);
            setImageError(true);
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex flex-col items-center justify-center text-white">
          <div className="text-4xl font-bold">#{tokenId.toString()}</div>
          <div className="text-xs mt-2 opacity-80">Avatar NFT</div>
        </div>
      )}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-lg">
          <CheckCircle2 size={20} className="text-white" />
        </div>
      )}
      {!loading && metadata?.name && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white text-xs p-2 text-center truncate">
          {metadata.name}
        </div>
      )}
    </div>
  );
}