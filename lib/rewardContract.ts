export const REWARD_TOKEN_CONTRACT = {
  address: process.env.NEXT_PUBLIC_REWARD_TOKEN_ADDRESS as `0x${string}`,
  abi: [
    {
      "inputs": [{"internalType": "address","name": "account","type": "address"}],
      "name": "balanceOf",
      "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [{"internalType": "string","name": "","type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [{"internalType": "string","name": "","type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [{"internalType": "uint8","name": "","type": "uint8"}],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const
};

export const REWARD_SYSTEM_CONTRACT = {
  address: process.env.NEXT_PUBLIC_REWARD_SYSTEM_ADDRESS as `0x${string}`,
  abi: [
    {
      "inputs": [{"internalType": "address","name": "user","type": "address"}],
      "name": "getPendingRewards",
      "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "user","type": "address"}],
      "name": "getTotalEarned",
      "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "baseLikeReward",
      "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "baseCommentReward",
      "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "basePostReward",
      "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const
};