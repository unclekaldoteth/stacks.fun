'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import NFTGallery from '@/components/NFTGallery';
import TransactionHistory from '@/components/TransactionHistory';
import { useWallet } from '@/components/WalletProvider';
import { getSTXBalance, getAccountNFTs } from '@/lib/hiro';
import { formatAddress, getExplorerAddressUrl } from '@/lib/stacks';

export default function ProfilePage() {
    const { isConnected, address, connect } = useWallet();
    const [balance, setBalance] = useState<string | null>(null);
    const [nftCount, setNftCount] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'nfts' | 'transactions'>('nfts');

    useEffect(() => {
        const fetchData = async () => {
            if (!address) return;

            // Fetch balance
            const bal = await getSTXBalance(address);
            setBalance(bal);

            // Fetch NFT count
            const nfts = await getAccountNFTs(address);
            setNftCount(nfts?.length || 0);
        };

        fetchData();
    }, [address]);

    if (!isConnected || !address) {
        return (
            <main className="min-h-screen pb-20">
                <Navbar />

                <div className="pt-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
                    <div className="bg-zinc-900/50 rounded-3xl p-12 border border-white/5">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-6 flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
                        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                            Connect your Stacks wallet to view your profile, NFT collection, and transaction history.
                        </p>
                        <button
                            onClick={connect}
                            className="bg-white text-black font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform"
                        >
                            Connect Wallet
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pb-20">
            <Navbar />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-3xl p-8 border border-white/10 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                            <span className="text-3xl font-bold text-white">
                                {address.slice(2, 4).toUpperCase()}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold mb-2">{formatAddress(address, 8, 6)}</h1>
                            <a
                                href={getExplorerAddressUrl(address)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 text-sm"
                            >
                                View on Explorer →
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{balance || '-'}</div>
                                <div className="text-sm text-zinc-400">STX Balance</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{nftCount}</div>
                                <div className="text-sm text-zinc-400">NFTs Owned</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('nfts')}
                        className={`px-6 py-3 rounded-full font-medium transition-all ${activeTab === 'nfts'
                                ? 'bg-white text-black'
                                : 'bg-zinc-800 text-white hover:bg-zinc-700'
                            }`}
                    >
                        My NFTs
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`px-6 py-3 rounded-full font-medium transition-all ${activeTab === 'transactions'
                                ? 'bg-white text-black'
                                : 'bg-zinc-800 text-white hover:bg-zinc-700'
                            }`}
                    >
                        Transactions
                    </button>
                </div>

                {/* Content */}
                <div className="bg-zinc-900/30 rounded-2xl p-6 border border-white/5">
                    {activeTab === 'nfts' ? (
                        <NFTGallery showHeader={false} />
                    ) : (
                        <TransactionHistory showHeader={false} />
                    )}
                </div>
            </div>
        </main>
    );
}
