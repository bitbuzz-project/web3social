export const TIP_CONTRACT = {
  address: process.env.NEXT_PUBLIC_TIP_CONTRACT_ADDRESS as `0x${string}`,
  abi: [
    {
      inputs: [
        { internalType: "address", name: "_recipient", type: "address" },
        { internalType: "uint256", name: "_postId", type: "uint256" },
        { internalType: "uint256", name: "_amount", type: "uint256" },
        { internalType: "string", name: "_message", type: "string" }
      ],
      name: "tipPost",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ internalType: "uint256", name: "_postId", type: "uint256" }],
      name: "getPostTipTotal",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [{ internalType: "uint256", name: "_postId", type: "uint256" }],
      name: "getPostTips",
      outputs: [{
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "tipper", type: "address" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "postId", type: "uint256" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "string", name: "message", type: "string" }
        ],
        internalType: "struct TipSystem.Tip[]",
        name: "",
        type: "tuple[]"
      }],
      stateMutability: "view",
      type: "function"
    }
  ] as const
};