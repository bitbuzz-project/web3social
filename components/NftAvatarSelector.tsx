'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';

interface NftAvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

// ERC-721 ABI for reading NFTs
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

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Read NFT balance
  const { data: balance } = useReadContract({
    address: nftContract as `0x${string}`,
    abi: ERC721_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!nftContract && !!address,
    },
  });

  const handleSetAvatar = () => {
    if (!selectedNft) return;

    writeContract({
      address: SOCIAL_MEDIA_CONTRACT.address,
      abi: SOCIAL_MEDIA_CONTRACT.abi,
      functionName: 'setNftAvatar',
      args: [selectedNft.contract as `0x${string}`, BigInt(selectedNft.tokenId)],
    });
  };

  if (isSuccess) {
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 1500);
  }

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
          {/* NFT Contract Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              NFT Contract Address
            </label>
            <input
              type="text"
              value={nftContract}
              onChange={(e) => setNftContract(e.target.value)}
              placeholder="0x..."
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Enter an ERC-721 NFT contract address (e.g., your NFT collection)
            </p>
          </div>

          {/* NFT Grid */}
          {nftContract && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Your NFTs ({nftCount})
                </h3>
              </div>

              {nftCount > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: Math.min(nftCount, 9) }, (_, i) => (
                    <NftCard
                      key={i}
                      contract={nftContract}
                      tokenIndex={i}
                      isSelected={selectedNft?.tokenId === i.toString()}
                      onSelect={(tokenId) => setSelectedNft({ contract: nftContract, tokenId })}
                    />
                  ))}
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

  const { data: tokenId } = useReadContract({
    address: contract as `0x${string}`,
    abi: ERC721_ABI,
    functionName: 'tokenOfOwnerByIndex',
    args: [address as `0x${string}`, BigInt(tokenIndex)],
  });

  const { data: tokenURI } = useReadContract({
    address: contract as `0x${string}`,
    abi: ERC721_ABI,
    functionName: 'tokenURI',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });

  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch metadata
  useState(() => {
    if (tokenURI) {
      fetch(tokenURI as string)
        .then((res) => res.json())
        .then((data) => {
          setMetadata(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  });

  if (!tokenId) return null;

  return (
    <div
      onClick={() => onSelect(tokenId.toString())}
      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-4 transition ${
        isSelected
          ? 'border-blue-500 shadow-lg'
          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      {loading ? (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      ) : metadata?.image ? (
        <img
          src={metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
          alt={metadata.name || `NFT #${tokenId}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
          #{tokenId.toString()}
        </div>
      )}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
          <CheckCircle2 size={20} className="text-white" />
        </div>
      )}
    </div>
  );
}