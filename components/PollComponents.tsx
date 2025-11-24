'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { POLLS_CONTRACT } from '@/lib/pollsContract';
import { BarChart3, Clock, Plus, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Create Poll Modal
export function CreatePollModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(24);
  const [weighted, setWeighted] = useState(false);

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    if (!question.trim() || options.some(o => !o.trim())) {
      alert('Please fill all fields');
      return;
    }

    writeContract({
      address: POLLS_CONTRACT.address,
      abi: POLLS_CONTRACT.abi,
      functionName: 'createPoll',
      args: [question, options, BigInt(duration), false, weighted],
    });
  };

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        setQuestion('');
        setOptions(['', '']);
        setDuration(24);
        setWeighted(false);
        onClose();
        window.location.reload();
      }, 1500);
    }
  }, [isSuccess, onClose]);

  if (!isOpen) return null;

  const isLoading = isPending || isConfirming;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-[600px] shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={24} className="text-blue-500" />
            Create Poll
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white mb-4"
            disabled={isLoading}
          />

          <div className="space-y-2 mb-4">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  disabled={isLoading}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 10 && (
            <button
              onClick={addOption}
              className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition flex items-center justify-center gap-2 mb-4"
            >
              <Plus size={20} />
              Add Option
            </button>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (hours)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="1"
                max="168"
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                disabled={isLoading}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={weighted}
                onChange={(e) => setWeighted(e.target.checked)}
                className="w-4 h-4 text-blue-500 rounded"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Weight votes by token holdings
              </span>
            </label>
          </div>

          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="w-full mt-4 bg-blue-500 text-white p-3 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Create Poll'}
          </button>

          {isSuccess && (
            <div className="mt-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
              ✅ Poll created successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Poll Card Display
export function PollCard({ pollId }: { pollId: number }) {
  const { address } = useAccount();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const { data: pollData } = useReadContract({
    address: POLLS_CONTRACT.address,
    abi: POLLS_CONTRACT.abi,
    functionName: 'getPollResults',
    args: [BigInt(pollId)],
  });

  const { data: hasVoted } = useReadContract({
    address: POLLS_CONTRACT.address,
    abi: POLLS_CONTRACT.abi,
    functionName: 'hasUserVoted',
    args: [BigInt(pollId), address as `0x${string}`],
  });

  const { data: userChoice } = useReadContract({
    address: POLLS_CONTRACT.address,
    abi: POLLS_CONTRACT.abi,
    functionName: 'getUserVoteChoice',
    args: [BigInt(pollId), address as `0x${string}`],
    query: { enabled: !!hasVoted },
  });

  const { writeContract, isPending } = useWriteContract();

  const handleVote = (optionIndex: number) => {
    if (hasVoted) return;

    writeContract({
      address: POLLS_CONTRACT.address,
      abi: POLLS_CONTRACT.abi,
      functionName: 'vote',
      args: [BigInt(pollId), BigInt(optionIndex)],
    });
  };

  if (!pollData) return null;

  const [question, options, votes, totalVotes, isActive, endTime] = pollData;
  const timeLeft = formatDistanceToNow(new Date(Number(endTime) * 1000), { addSuffix: true });

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={20} className="text-blue-500" />
        <span className="text-sm font-semibold text-blue-500">Poll</span>
        {isActive && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Active</span>}
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{question}</h3>

      <div className="space-y-2 mb-3">
        {options.map((option: string, index: number) => {
          const voteCount = Number(votes[index]);
          const percentage = Number(totalVotes) > 0 ? (voteCount / Number(totalVotes)) * 100 : 0;
          const isSelected = hasVoted && Number(userChoice) === index;

          return (
            <button
              key={index}
              onClick={() => !hasVoted && handleVote(index)}
              disabled={!isActive || hasVoted || isPending}
              className={`w-full relative overflow-hidden rounded-lg border-2 transition ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : hasVoted
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
              } ${!isActive || hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {hasVoted && (
                <div
                  className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              )}
              <div className="relative p-3 flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{option}</span>
                {hasVoted && (
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    {percentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{Number(totalVotes)} votes</span>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {isActive ? `Ends ${timeLeft}` : 'Poll ended'}
        </span>
      </div>
    </div>
  );
}

function useAccount() {
  // Import from wagmi
  return { address: '0x...' as `0x${string}` };
}