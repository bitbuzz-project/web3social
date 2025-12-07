'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { TIP_CONTRACT } from '@/lib/tipContract';
import { REWARD_TOKEN_CONTRACT } from '@/lib/rewardContract';
import { parseUnits, formatUnits } from 'viem';
import { X, Loader2, DollarSign } from 'lucide-react';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  recipient: string;
  recipientUsername: string;
}

export default function TipModal({ isOpen, onClose, postId, recipient, recipientUsername }: TipModalProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'input' | 'approve' | 'tip'>('input');

  const { data: balance } = useReadContract({
    address: REWARD_TOKEN_CONTRACT.address,
    abi: REWARD_TOKEN_CONTRACT.abi,
    functionName: 'balanceOf',
    args: [recipient as `0x${string}`],
  });

  const { data: approveHash, writeContract: approve, isPending: approving } = useWriteContract();
  const { isLoading: approveConfirming, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  const { data: tipHash, writeContract: tip, isPending: tipping } = useWriteContract();
  const { isLoading: tipConfirming, isSuccess: tipSuccess } = useWaitForTransactionReceipt({ hash: tipHash });

  const handleApprove = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    const amountWei = parseUnits(amount, 18);
    approve({
      address: REWARD_TOKEN_CONTRACT.address,
      abi: [
        {
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" }
          ],
          name: "approve",
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function"
        }
      ],
      functionName: 'approve',
      args: [TIP_CONTRACT.address, amountWei],
    });
  };

  const handleTip = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    const amountWei = parseUnits(amount, 18);
    tip({
      address: TIP_CONTRACT.address,
      abi: TIP_CONTRACT.abi,
      functionName: 'tipPost',
      args: [recipient as `0x${string}`, BigInt(postId), amountWei, message],
    });
  };

  if (approveSuccess && step === 'input') {
    setStep('tip');
  }

  if (tipSuccess) {
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 2000);
  }

  if (!isOpen) return null;

  const balanceFormatted = balance ? formatUnits(balance, 18) : '0';

  return (
 <div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onClick={onClose} // Add this
  >        <div 
      className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6"
      onClick={(e) => e.stopPropagation()} // Add this
    >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign size={24} className="text-yellow-500" />
            Tip @{recipientUsername}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (SRCOIN)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-2">
              {['1', '5', '10', '50'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full text-sm"
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Great post!"
              rows={3}
              className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {step === 'input' && (
            <button
              onClick={handleApprove}
              disabled={!amount || parseFloat(amount) <= 0 || approving || approveConfirming}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {(approving || approveConfirming) && <Loader2 size={18} className="animate-spin" />}
              {approving ? 'Approving...' : approveConfirming ? 'Confirming...' : 'Approve & Tip'}
            </button>
          )}

          {step === 'tip' && (
            <button
              onClick={handleTip}
              disabled={tipping || tipConfirming}
              className="w-full bg-yellow-500 text-white py-3 rounded-lg font-bold hover:bg-yellow-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {(tipping || tipConfirming) && <Loader2 size={18} className="animate-spin" />}
              {tipping ? 'Sending Tip...' : tipConfirming ? 'Confirming...' : `Send ${amount} SRCOIN`}
            </button>
          )}

          {tipSuccess && (
            <div className="text-center text-green-600 dark:text-green-400 text-sm">
              ✅ Tip sent successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}