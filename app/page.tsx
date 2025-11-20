import ConnectWallet from '@/components/ConnectWallet';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Web3 Social
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Decentralized Social Network
            </p>
            <ConnectWallet />
          </div>
        </div>
      </main>
    </>
  );
}