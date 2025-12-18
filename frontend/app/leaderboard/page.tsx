'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/api';
import { formatAddress, getExplorerAddressUrl } from '@/lib/stacks';
import { useWallet } from '@/components/WalletProvider';

export default function LeaderboardPage() {
    const { address } = useWallet();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboard(100);
                setLeaderboard(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <main className="min-h-screen bg-[var(--bg-primary)] text-white pb-20">
            <div className="main-container py-12">
                {/* Back Nav */}
                <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white mb-12 transition-colors">
                    [← back to terminal]
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-black italic tracking-tighter mb-4 text-white">Top Traders</h1>
                    <p className="text-[var(--text-secondary)] terminal-text text-sm max-w-xl">
                        rankings of the most active participants in the ecosystem based on trading volume and frequency.
                    </p>
                </div>

                {/* Prize Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 font-black">
                    <div className="pump-panel bg-zinc-900/20 border-[var(--accent-yellow)] text-center p-8 group hover:scale-105 transition-all">
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🥇</div>
                        <h3 className="text-[var(--accent-yellow)] uppercase tracking-[0.2em] text-xs mb-2">first position</h3>
                        <div className="text-3xl text-white terminal-text">500 STX</div>
                        <p className="text-[9px] text-[var(--text-muted)] mt-2 uppercase">+ ARCHON STATUS NFT</p>
                    </div>
                    <div className="pump-panel bg-zinc-900/20 border-zinc-500 text-center p-8 group hover:scale-105 transition-all">
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🥈</div>
                        <h3 className="text-zinc-400 uppercase tracking-[0.2em] text-xs mb-2">second position</h3>
                        <div className="text-3xl text-white terminal-text">250 STX</div>
                        <p className="text-[9px] text-[var(--text-muted)] mt-2 uppercase">+ ELITE STATUS NFT</p>
                    </div>
                    <div className="pump-panel bg-zinc-900/20 border-orange-700 text-center p-8 group hover:scale-105 transition-all">
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🥉</div>
                        <h3 className="text-orange-600 uppercase tracking-[0.2em] text-xs mb-2">third position</h3>
                        <div className="text-3xl text-white terminal-text">100 STX</div>
                        <p className="text-[9px] text-[var(--text-muted)] mt-2 uppercase">+ VETERAN STATUS NFT</p>
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="pump-panel bg-black border-[var(--border-bright)] overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-6 py-4 border-b border-[var(--border)] bg-zinc-900/50">
                        <div className="col-span-1">rank</div>
                        <div className="col-span-4">trader info</div>
                        <div className="col-span-3 text-right">trades</div>
                        <div className="col-span-4 text-right pr-4">volume</div>
                    </div>

                    <div className="divide-y divide-[var(--border)]">
                        {isLoading ? (
                            [...Array(10)].map((_, i) => (
                                <div key={i} className="px-6 py-6 animate-pulse flex gap-6">
                                    <div className="w-8 h-8 bg-zinc-900 rounded" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-2 bg-zinc-900 rounded w-1/4" />
                                        <div className="h-2 bg-zinc-900 rounded w-1/8" />
                                    </div>
                                </div>
                            ))
                        ) : leaderboard.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="text-4xl mb-4 opacity-20">🏆</div>
                                <h3 className="text-xl font-bold terminal-text">EMPTY ARENA</h3>
                                <p className="text-[var(--text-secondary)] text-xs mt-2 uppercase">waiting for the first challenger...</p>
                            </div>
                        ) : (
                            leaderboard.map((entry, index) => {
                                const entryAddress = entry.address || '';
                                const isCurrentUser = address && entryAddress.toLowerCase() === address.toLowerCase();
                                return (
                                    <div
                                        key={entry.id}
                                        className={`grid grid-cols-1 md:grid-cols-12 items-center px-6 py-4 group hover:bg-zinc-900 transition-colors ${isCurrentUser ? 'bg-[rgba(247,147,26,0.05)] border-l-4 border-[var(--accent-orange)]' : ''
                                            }`}
                                    >
                                        <div className="col-span-1 flex items-center md:block mb-2 md:mb-0">
                                            <div className={`w-10 h-10 md:w-8 md:h-8 rounded flex items-center justify-center font-black terminal-text ${index === 0 ? 'bg-[var(--accent-yellow)] text-black' :
                                                index === 1 ? 'bg-zinc-400 text-black' :
                                                    index === 2 ? 'bg-orange-700 text-white' :
                                                        'bg-black border border-[var(--border)] text-[var(--text-muted)]'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <span className="md:hidden ml-4 font-black uppercase text-[var(--text-muted)] text-[10px]">Rank</span>
                                        </div>

                                        <div className="col-span-4 flex items-center gap-4 mb-2 md:mb-0">
                                            <div className="w-10 h-10 rounded-full bg-black border border-[var(--border)] flex items-center justify-center text-[10px] font-black text-white group-hover:border-white transition-colors">
                                                {entryAddress.slice(2, 4).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-black text-white flex items-center gap-2">
                                                    <a href={getExplorerAddressUrl(entryAddress)} target="_blank" className="hover:text-blue-400 underline transition-colors">
                                                        {formatAddress(entryAddress, 10, 6)}
                                                    </a>
                                                    {isCurrentUser && <span className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--accent-orange)] text-black uppercase">you</span>}
                                                </div>
                                                <div className="text-[9px] text-[var(--text-muted)] uppercase mt-1 font-bold">verified collector</div>
                                            </div>
                                        </div>

                                        <div className="col-span-3 text-left md:text-right mb-2 md:mb-0">
                                            <span className="md:hidden text-[9px] font-black uppercase text-[var(--text-muted)] mr-2">trades:</span>
                                            <span className="text-white font-black terminal-text">{entry.total_trades}</span>
                                        </div>

                                        <div className="col-span-4 text-left md:text-right pr-4">
                                            <span className="md:hidden text-[9px] font-black uppercase text-[var(--text-muted)] mr-2">volume:</span>
                                            <span className="text-lg font-black text-[var(--accent-orange)] terminal-text">{entry.total_volume_stx.toLocaleString()} STX</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="mt-12 text-center max-w-lg mx-auto">
                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest leading-relaxed italic">
                        legendary traders aren't born, they are created in the bonding curve. trade often, trade wisely, and claim your place in the archives.
                    </p>
                </div>
            </div>
        </main>
    );
}
