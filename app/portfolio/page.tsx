'use client';

import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FeedNavigation from '@/components/FeedNavigation';
import { Wallet, TrendingUp, Image as ImageIcon, DollarSign, Plus, X } from 'lucide-react';
import { formatUnits } from 'viem';
import { SOCIAL_MEDIA_CONTRACT } from '@/lib/contract';

const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

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
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const publicClient = usePublicClient();
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts'>('tokens');
  const [ethBalance, setEthBalance] = useState('0');
  const [ethPrice, setEthPrice] = useState(0);
  const [customTokens, setCustomTokens] = useState<string[]>([]);
  const [customNFTs, setCustomNFTs] = useState<string[]>([]);
  const [totalValueUSD, setTotalValueUSD] = useState(0);

  const { data: profile } = useReadContract({
    address: SOCIAL_MEDIA_CONTRACT.address,
    abi: SOCIAL_MEDIA_CONTRACT.abi,
    functionName: 'getProfile',
    args: [address as `0x${string}`],
  });

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    async function fetchEthBalance() {
      if (!address || !publicClient) return;
      try {
        const balance = await publicClient.getBalance({ address });
        setEthBalance(formatUnits(balance, 18));
      } catch (error) {
        console.error('Error fetching ETH balance:', error);
      }
    }
    fetchEthBalance();
  }, [address, publicClient]);

  useEffect(() => {
    async function fetchEthPrice() {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    }
    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ethValue = parseFloat(ethBalance) * ethPrice;
    setTotalValueUSD(ethValue);
  }, [ethBalance, ethPrice]);

  if (!isConnected) return null;

  const username = profile?.username || `user_${address?.slice(-4)}`;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1280px] mx-auto flex">
        <div className="w-[68px] xl:w-[275px] flex-shrink-0">
          <div className="fixed w-[68px] xl:w-[275px] h-screen border-r border-gray-200 dark:border-gray-800">
            <FeedNavigation />
          </div>
        </div>

        <div className="flex-1 min-h-screen border-x border-gray-200 dark:border-gray-800">
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Wallet size={24} />
              Portfolio
            </h1>
          </div>

          <div className="p-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {address?.slice(2, 4).toUpperCase()}
                </div>
                <div>
                  <div className="text-xl font-bold">{username}</div>
                  <div className="text-sm opacity-75">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
                </div>
              </div>

              <div className="border-t border-white/20 pt-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <DollarSign size={24} />
                  <div className="text-4xl font-bold">${totalValueUSD.toFixed(2)}</div>
                </div>
                <div className="text-sm opacity-90">Total Portfolio Value</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-xs opacity-75 mb-1">ETH Balance</div>
                  <div className="text-lg font-bold">{parseFloat(ethBalance).toFixed(4)} ETH</div>
                  <div className="text-xs opacity-75">${(parseFloat(ethBalance) * ethPrice).toFixed(2)}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-xs opacity-75 mb-1">Network</div>
                  <div className="text-lg font-bold">Base Sepolia</div>
                  <div className="text-xs opacity-75">Testnet</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setActiveTab('tokens')}
                className={`flex-1 py-3 font-semibold transition ${
                  activeTab === 'tokens'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <TrendingUp size={18} className="inline mr-2" />
                Tokens
              </button>
              <button
                onClick={() => setActiveTab('nfts')}
                className={`flex-1 py-3 font-semibold transition ${
                  activeTab === 'nfts'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <ImageIcon size={18} className="inline mr-2" />
                NFTs
              </button>
            </div>

            {activeTab === 'tokens' ? (
              <TokensList
                userAddress={address as string}
                customTokens={customTokens}
                onAddToken={(token) => setCustomTokens([...customTokens, token])}
              />
            ) : (
              <NFTsList
                userAddress={address as string}
                customNFTs={customNFTs}
                onAddNFT={(nft) => setCustomNFTs([...customNFTs, nft])}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TokensList({
  userAddress,
  customTokens,
  onAddToken,
}: {
  userAddress: string;
  customTokens: string[];
  onAddToken: (token: string) => void;
}) {
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = () => {
    if (newTokenAddress && /^0x[a-fA-F0-9]{40}$/.test(newTokenAddress)) {
      onAddToken(newTokenAddress);
      setNewTokenAddress('');
      setShowAddForm(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Tokens</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <Plus size={16} />
          Add Token
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Add Custom Token</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Token Contract Address (0x...)"
            value={newTokenAddress}
            onChange={(e) => setNewTokenAddress(e.target.value)}
            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg mb-2 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleAdd}
            disabled={!newTokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(newTokenAddress)}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Token
          </button>
        </div>
      )}

      <div className="space-y-2">
        {customTokens.map((tokenAddress) => (
          <TokenItem key={tokenAddress} tokenAddress={tokenAddress} userAddress={userAddress} />
        ))}
        {customTokens.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-semibold mb-2">No tokens added yet</p>
            <p className="text-sm">Add a token contract address to track your balance</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TokenItem({ tokenAddress, userAddress }: { tokenAddress: string; userAddress: string }) {
  const { data: balance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol',
  });

  const { data: name } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'name',
  });

  const formattedBalance = balance && decimals ? formatUnits(balance, decimals) : '0';
  const scanUrl = `https://sepolia.basescan.org/token/${tokenAddress}`;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
          {symbol?.toString().slice(0, 2) || '??'}
        </div>
        <div>
          <div className="font-bold text-gray-900 dark:text-white">{name?.toString() || 'Unknown Token'}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{symbol?.toString() || 'N/A'}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-gray-900 dark:text-white">{parseFloat(formattedBalance).toFixed(4)}</div>
        <a href={scanUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
          View on BaseScan
        </a>
      </div>
    </div>
  );
}

function NFTsList({
  userAddress,
  customNFTs,
  onAddNFT,
}: {
  userAddress: string;
  customNFTs: string[];
  onAddNFT: (nft: string) => void;
}) {
  const [newNFTAddress, setNewNFTAddress] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = () => {
    if (newNFTAddress && /^0x[a-fA-F0-9]{40}$/.test(newNFTAddress)) {
      onAddNFT(newNFTAddress);
      setNewNFTAddress('');
      setShowAddForm(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your NFTs</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 text-sm bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
        >
          <Plus size={16} />
          Add Collection
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Add NFT Collection</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <input
            type="text"
            placeholder="NFT Contract Address (0x...)"
            value={newNFTAddress}
            onChange={(e) => setNewNFTAddress(e.target.value)}
            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg mb-2 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleAdd}
            disabled={!newNFTAddress || !/^0x[a-fA-F0-9]{40}$/.test(newNFTAddress)}
            className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Collection
          </button>
        </div>
      )}

      <div className="space-y-4">
        {customNFTs.map((nftAddress) => (
          <NFTCollection key={nftAddress} nftAddress={nftAddress} userAddress={userAddress} />
        ))}
        {customNFTs.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-semibold mb-2">No NFT collections added yet</p>
            <p className="text-sm">Add an NFT contract address to view your collection</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NFTCollection({ nftAddress, userAddress }: { nftAddress: string; userAddress: string }) {
  const { data: balance } = useReadContract({
    address: nftAddress as `0x${string}`,
    abi: ERC721_ABI,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
  });

  const { data: collectionName } = useReadContract({
    address: nftAddress as `0x${string}`,
    abi: ERC721_ABI,
    functionName: 'name',
  });

  const nftCount = balance ? Number(balance) : 0;
  const scanUrl = `https://sepolia.basescan.org/token/${nftAddress}`;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-bold text-gray-900 dark:text-white">{collectionName?.toString() || 'Unknown Collection'}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{nftCount} NFTs owned</div>
        </div>
        <a href={scanUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:underline">
          View on BaseScan
        </a>
      </div>

      {nftCount > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: Math.min(nftCount, 6) }, (_, i) => (
            <NFTCard key={i} nftAddress={nftAddress} userAddress={userAddress} tokenIndex={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function NFTCard({
  nftAddress,
  userAddress,
  tokenIndex,
}: {
  nftAddress: string;
  userAddress: string;
  tokenIndex: number;
}) {
  const [metadata, setMetadata] = useState<any>(null);

  const { data: tokenId } = useReadContract({
    address: nftAddress as `0x${string}`,
    abi: ERC721_ABI,
    functionName: 'tokenOfOwnerByIndex',
    args: [userAddress as `0x${string}`, BigInt(tokenIndex)],
  });

  const { data: tokenURI } = useReadContract({
    address: nftAddress as `0x${string}`,
    abi: ERC721_ABI,
    functionName: 'tokenURI',
    args: tokenId ? [tokenId] : undefined,
    query: { enabled: !!tokenId },
  });

  useEffect(() => {
    if (tokenURI) {
      const uri = tokenURI as string;
      if (uri.startsWith('data:')) {
        try {
          const base64Data = uri.split(',')[1];
          const jsonData = JSON.parse(atob(base64Data));
          setMetadata(jsonData);
        } catch (error) {
          console.error('Error parsing metadata:', error);
        }
      } else if (uri.startsWith('ipfs://')) {
        fetch(uri.replace('ipfs://', 'https://ipfs.io/ipfs/'))
          .then((res) => res.json())
          .then(setMetadata)
          .catch(console.error);
      } else {
        fetch(uri)
          .then((res) => res.json())
          .then(setMetadata)
          .catch(console.error);
      }
    }
  }, [tokenURI]);

  const getImageUrl = (image: string) => {
    if (image?.startsWith('ipfs://')) {
      return image.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return image;
  };

  const displayTokenId = tokenId ? tokenId.toString() : '?';

  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
      {metadata?.image ? (
        <img src={getImageUrl(metadata.image)} alt={`NFT ${displayTokenId}`} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
          #{displayTokenId}
        </div>
      )}
    </div>
  );
}