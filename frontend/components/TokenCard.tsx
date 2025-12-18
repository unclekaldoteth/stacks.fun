'use client';

import Link from 'next/link';
import { Token, getProgressToGraduation } from '@/lib/api';
import { formatAddress } from '@/lib/stacks';

interface TokenCardProps {
    token: Token;
}

export default function TokenCard({ token }: TokenCardProps) {
    const progress = getProgressToGraduation(token.market_cap);

    return (
        <Link href={`/token/${token.symbol}`}>
            <div className="pump-card p-3 group">
                <div className="flex gap-4">
                    {/* Token Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-black border border-[var(--border)] rounded-lg overflow-hidden relative">
                        {token.image_uri ? (
                            <img
                                src={token.image_uri}
                                alt={token.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--text-muted)]">
                                {token.symbol[0]}
                            </div>
                        )}
                        {token.is_graduated && (
                            <div className="absolute top-1 right-1 bg-[var(--accent-orange)] text-black text-[10px] font-bold px-1 rounded">
                                GRAD
                            </div>
                        )}
                    </div>

                    {/* Token Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-bold truncate text-white group-hover:text-[var(--accent-orange)] transition-colors">
                                {token.name}
                            </h3>
                            <span className="text-[10px] text-[var(--text-muted)] terminal-text">
                                [${token.symbol}]
                            </span>
                        </div>

                        <div className="text-[11px] text-[var(--text-muted)] mb-2">
                            created by <span className="text-blue-400 hover:underline">{formatAddress(token.creator, 4, 4)}</span>
                        </div>

                        <div className="space-y-1 mb-3">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-tighter">Market Cap</span>
                                <span className="text-xs font-black text-[var(--accent-orange)] terminal-text">
                                    {token.market_cap.toLocaleString()} STX
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-tighter">Price</span>
                                <span className="text-[10px] font-bold text-white terminal-text">
                                    {token.current_price.toFixed(6)} STX
                                </span>
                            </div>
                        </div>

                        {/* Graduation Progress */}
                        {!token.is_graduated && (
                            <div className="mt-auto pt-2 border-t border-[var(--border)]">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] text-[var(--text-muted)] font-bold">BONDING CURVE</span>
                                    <span className="text-[9px] text-white font-bold">{progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-1 bg-black rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--accent-orange)]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="mt-3 text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed italic border-l-2 border-[var(--border)] pl-2">
                    {token.description || "No description provided."}
                </p>
            </div>
        </Link>
    );
}
