'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/api';
import { formatAddress, getExplorerAddressUrl } from '@/lib/stacks';
import { useWallet } from './WalletProvider';

interface LeaderboardProps {
    limit?: number;
    showHeader?: boolean;
}

export default function Leaderboard({ limit = 10, showHeader = true }: LeaderboardProps) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { address } = useWallet();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            const data = await getLeaderboard();
            setEntries(data.slice(0, limit));
            setIsLoading(false);
        };

        fetchLeaderboard();
    }, [limit]);

    const getRankBadge = (rank: number) => {
        switch (rank) {
            case 1:
                return (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-sm shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                        1
                    </div>
                );
            case 2:
                return (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-black font-bold text-sm">
                        2
                    </div>
                );
            case 3:
                return (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-sm">
                        3
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-medium text-sm">
                        {rank}
                    </div>
                );
        }
    };

    if (isLoading) {
        return (
            <div>
                {showHeader && (
                    <h2 className="text-2xl font-bold mb-6">Top Collectors</h2>
                )}
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-zinc-800" />
                            <div className="flex-1">
                                <div className="h-4 bg-zinc-800 rounded w-1/3" />
                            </div>
                            <div className="h-4 bg-zinc-800 rounded w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="text-center py-12">
                {showHeader && (
                    <h2 className="text-2xl font-bold mb-6">Top Collectors</h2>
                )}
                <div className="text-zinc-500">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <p>No collectors yet</p>
                    <p className="text-sm mt-1">Be the first to mint!</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {showHeader && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Top Collectors</h2>
                    <div className="text-sm text-zinc-500">This week</div>
                </div>
            )}
            <div className="space-y-2">
                {entries.map((entry, index) => {
                    const rank = index + 1;
                    const entryAddress = entry.address || '';
                    const isCurrentUser = address && entryAddress.toLowerCase() === address.toLowerCase();

                    return (
                        <div
                            key={entry.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isCurrentUser
                                ? 'bg-purple-500/10 border-purple-500/30'
                                : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                                }`}
                        >
                            {getRankBadge(rank)}

                            <a
                                href={getExplorerAddressUrl(entryAddress)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 font-mono text-sm text-white hover:text-purple-400 transition-colors"
                            >
                                {formatAddress(entryAddress, 8, 6)}
                                {isCurrentUser && (
                                    <span className="ml-2 text-xs text-purple-400">(You)</span>
                                )}
                            </a>

                            <div className="text-right">
                                <div className="font-bold text-white">{entry.total_trades}</div>
                                <div className="text-xs text-zinc-500">trades</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
