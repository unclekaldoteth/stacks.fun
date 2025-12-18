'use client';

import { useState, useEffect } from 'react';
import { formatAddress, getExplorerTxUrl } from '@/lib/stacks';
import { getContractEvents } from '@/lib/hiro';
import { CONTRACTS } from '@/lib/contracts';

interface Trade {
    txId: string;
    type: 'buy' | 'sell';
    trader: string;
    stxAmount: number;
    tokenAmount: number;
    tokenSymbol: string;
    timestamp: Date;
}

interface RecentTradesProps {
    limit?: number;
    showTitle?: boolean;
}

export default function RecentTrades({ limit = 10, showTitle = true }: RecentTradesProps) {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrades();
        const interval = setInterval(fetchTrades, 20000); // Refresh every 20s
        return () => clearInterval(interval);
    }, [limit]);

    async function fetchTrades() {
        try {
            // Fetch events from bonding curve contract
            const events = await getContractEvents(
                CONTRACTS.bondingCurve.address,
                CONTRACTS.bondingCurve.name,
                limit * 2
            );

            if (!events?.results) {
                setLoading(false);
                return;
            }

            const parsedTrades: Trade[] = [];

            for (const event of events.results) {
                try {
                    const repr = event.contract_log?.value?.repr || '';

                    // Parse buy events
                    if (repr.includes('tokens-bought') || repr.includes('buy')) {
                        parsedTrades.push({
                            txId: event.tx_id,
                            type: 'buy',
                            trader: extractAddress(repr) || 'Unknown',
                            stxAmount: extractNumber(repr, 'stx') / 1_000_000,
                            tokenAmount: extractNumber(repr, 'tokens') / 100_000_000,
                            tokenSymbol: 'TKN',
                            timestamp: new Date(event.block_time_iso || Date.now())
                        });
                    }

                    // Parse sell events
                    if (repr.includes('tokens-sold') || repr.includes('sell')) {
                        parsedTrades.push({
                            txId: event.tx_id,
                            type: 'sell',
                            trader: extractAddress(repr) || 'Unknown',
                            stxAmount: extractNumber(repr, 'stx') / 1_000_000,
                            tokenAmount: extractNumber(repr, 'tokens') / 100_000_000,
                            tokenSymbol: 'TKN',
                            timestamp: new Date(event.block_time_iso || Date.now())
                        });
                    }
                } catch (e) {
                    // Skip malformed events
                }
            }

            setTrades(parsedTrades.slice(0, limit));
        } catch (error) {
            console.error('Error fetching trades:', error);
        } finally {
            setLoading(false);
        }
    }

    // Helper to extract address from Clarity repr
    function extractAddress(repr: string): string | null {
        const match = repr.match(/S[A-Z0-9]{39,}/);
        return match ? match[0] : null;
    }

    // Helper to extract number from Clarity repr
    function extractNumber(repr: string, key: string): number {
        const regex = new RegExp(`${key}[^u]*u(\\d+)`, 'i');
        const match = repr.match(regex);
        return match ? parseInt(match[1]) : 0;
    }

    function getTimeAgo(date: Date): string {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    if (loading) {
        return (
            <div className="pump-panel">
                {showTitle && (
                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--accent-orange)] mb-4">
                        Recent Trades
                    </h3>
                )}
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-zinc-900 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (trades.length === 0) {
        return (
            <div className="pump-panel">
                {showTitle && (
                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--accent-orange)] mb-4">
                        Recent Trades
                    </h3>
                )}
                <div className="text-center py-8 text-[var(--text-muted)]">
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-xs">No trades yet</p>
                    <p className="text-[10px] mt-1">Be the first to trade!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pump-panel">
            {showTitle && (
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--accent-orange)] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] animate-pulse" />
                        Recent Trades
                    </h3>
                    <span className="text-[10px] text-[var(--text-muted)] terminal-text">
                        {trades.length} trades
                    </span>
                </div>
            )}

            <div className="space-y-2">
                {trades.map((trade, index) => (
                    <a
                        key={`${trade.txId}-${index}`}
                        href={getExplorerTxUrl(trade.txId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg bg-black/50 hover:bg-zinc-900 border border-transparent hover:border-[var(--border)] transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Trade Type Badge */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${trade.type === 'buy'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {trade.type === 'buy' ? '↗' : '↘'}
                                </div>

                                {/* Trade Info */}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold uppercase ${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {trade.type}
                                        </span>
                                        <span className="text-xs text-white font-bold">
                                            {trade.tokenAmount.toLocaleString()} {trade.tokenSymbol}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-[var(--text-muted)]">
                                        by <span className="text-blue-400">{formatAddress(trade.trader, 4, 4)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* STX Amount & Time */}
                            <div className="text-right">
                                <div className="text-xs font-bold text-[var(--accent-orange)] terminal-text">
                                    {trade.stxAmount.toFixed(2)} STX
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)]">
                                    {getTimeAgo(trade.timestamp)}
                                </div>
                            </div>
                        </div>

                        {/* View TX Link */}
                        <div className="text-[9px] text-[var(--text-muted)] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            [view on explorer →]
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
