"use client";

import Navbar from '@/components/Navbar';
import { useWallet } from '@/components/WalletProvider';
import { getStacksConnect, getNetwork, getAppDetails, getExplorerTxUrl } from '@/lib/stacks';
import { useState } from 'react';

interface LaunchDetailClientProps {
    id: string;
}

export default function LaunchDetailClient({ id }: LaunchDetailClientProps) {
    const { isConnected, address, connect } = useWallet();
    const [isMinting, setIsMinting] = useState(false);
    const [txId, setTxId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Mock launch data - in production, fetch from API
    const launchData = {
        id,
        title: 'Cyberpunk Samsara',
        description: 'Enter the void. A collection of 10,000 unique avatars living on the Bitcoin network via Stacks. Each token grants access to the exclusive Samsara DAO and future drops.',
        price: 50,
        maxSupply: 1000,
        minted: 432,
        status: 'live' as 'live' | 'upcoming' | 'sold_out' | 'ended',
        contractAddress: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9',
        contractName: 'stacks-launchpad-v1',
    };

    const handleMint = async () => {
        if (!isConnected) {
            connect();
            return;
        }

        setIsMinting(true);
        setError(null);
        setTxId(null);

        try {
            const stacksConnect = await getStacksConnect();
            const network = await getNetwork();

            if (!stacksConnect || !network) {
                throw new Error('Failed to load Stacks modules');
            }

            const { openContractCall } = stacksConnect;

            await openContractCall({
                network,
                contractAddress: launchData.contractAddress,
                contractName: launchData.contractName,
                functionName: 'mint',
                functionArgs: [],
                onFinish: (data: { txId: string }) => {
                    console.log('Transaction finished:', data);
                    setTxId(data.txId);
                    setIsMinting(false);
                },
                onCancel: () => {
                    console.log('Transaction canceled');
                    setIsMinting(false);
                },
                appDetails: getAppDetails(),
            });
        } catch (err) {
            console.error('Mint error:', err);
            setError(err instanceof Error ? err.message : 'Failed to initiate mint');
            setIsMinting(false);
        }
    };

    const progressPercent = (launchData.minted / launchData.maxSupply) * 100;

    return (
        <main className="min-h-screen pb-20">
            <Navbar />

            <div className="pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Image */}
                    <div className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black/80" />
                        <div className="absolute inset-0 flex items-center justify-center text-white/20 text-9xl font-bold">
                            #{id}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div>
                        {/* Status Badge */}
                        <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold tracking-wider mb-6 border ${launchData.status === 'live'
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            : launchData.status === 'upcoming'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                            }`}>
                            {launchData.status.toUpperCase()}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold mb-6">{launchData.title}</h1>

                        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                            {launchData.description}
                        </p>

                        {/* Stats Card */}
                        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-400">Price</span>
                                <span className="text-2xl font-bold text-white">{launchData.price} STX</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Minted</span>
                                <span className="text-white">{launchData.minted.toLocaleString()} / {launchData.maxSupply.toLocaleString()}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-zinc-800 h-2 rounded-full mt-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-right">
                                {progressPercent.toFixed(1)}% minted
                            </p>
                        </div>

                        {/* Success Message */}
                        {txId && (
                            <div className="mb-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                <p className="text-orange-400 font-medium mb-2">🎉 Transaction submitted!</p>
                                <a
                                    href={getExplorerTxUrl(txId)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-orange-300 hover:text-orange-200 underline break-all"
                                >
                                    View on Explorer →
                                </a>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <p className="text-red-400 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Mint Button */}
                        <button
                            onClick={handleMint}
                            disabled={isMinting || launchData.status === 'sold_out'}
                            className={`w-full text-xl font-bold py-4 rounded-xl transition-all ${launchData.status === 'sold_out'
                                ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                                : isMinting
                                    ? 'bg-gray-600 text-gray-400 cursor-wait'
                                    : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {isMinting ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Minting...
                                </span>
                            ) : launchData.status === 'sold_out' ? (
                                'Sold Out'
                            ) : !isConnected ? (
                                'Connect Wallet to Mint'
                            ) : (
                                'Mint Now'
                            )}
                        </button>

                        {/* Footer Info */}
                        <div className="flex items-center justify-center gap-4 mt-6 text-sm text-zinc-500">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Secured by Bitcoin
                            </span>
                            <span>•</span>
                            <span>On Stacks</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
