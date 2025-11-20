import ConnectWallet from '@/components/ConnectWallet';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Web3 Social
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Decentralized Social Network
          </p>
          <ConnectWallet />
        </div>
      </div>
    </main>
  );
}