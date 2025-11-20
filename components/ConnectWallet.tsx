'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
    >
      Connect Wallet
    </button>
  );
}