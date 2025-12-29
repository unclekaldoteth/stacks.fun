'use client';

import Link from 'next/link';
import { Token, getProgressToGraduation } from '@/lib/api';
import { formatAddress } from '@/lib/stacks';

interface TokenCardProps {
    token: Token;
    rank?: number;
    showVolume?: boolean;
}

// Mock 24h change - in production this would come from API
function get24hChange(token: Token): number {
    // Generate consistent "random" change based on token id
    const seed = token.id.charCodeAt(0) + token.id.charCodeAt(1);
    return ((seed % 40) - 15) / 10; // -1.5% to +2.5%
}

// Mock volume - in production this would come from API
function get24hVolume(token: Token): number {
    return Math.floor(token.market_cap * 0.15); // 15% of market cap as fake volume
}

export default function TokenCard({ token, rank, showVolume = true }: TokenCardProps) {
    const progress = getProgressToGraduation(token.market_cap);
    const priceChange = get24hChange(token);
    const volume = get24hVolume(token);
    const isPositive = priceChange >= 0;
    const isTrending = rank !== undefined && rank <= 3;

    return (
        <Link href={`/token/${token.symbol}`}>
            <div className={`pump-card p-3 group relative overflow-hidden ${isTrending ? 'ring-1 ring-[var(--accent-orange)]/30' : ''
                }`}>
                {/* Trending Glow Effect */}
                {isTrending && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-orange)]/5 to-transparent pointer-events-none" />
                )}

                {/* Rank Badge */}
                {rank !== undefined && rank <= 10 && (
                    <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${rank === 1 ? 'bg-yellow-500 text-black' :
                            rank === 2 ? 'bg-gray-400 text-black' :
                                rank === 3 ? 'bg-amber-700 text-white' :
                                    'bg-zinc-800 text-white'
                        }`}>
                        #{rank}
                    </div>
                )}

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
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--text-muted)] bg-gradient-to-br from-zinc-800 to-zinc-900">
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
                            {/* Market Cap with 24h Change */}
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-tighter">Market Cap</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-[var(--accent-orange)] terminal-text">
                                        ${token.market_cap.toLocaleString()}
                                    </span>
                                    <span className={`text-[10px] font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                        {isPositive ? '↑' : '↓'}{Math.abs(priceChange).toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-tighter">Price</span>
                                <span className="text-[10px] font-bold text-white terminal-text">
                                    ${token.current_price.toFixed(6)}
                                </span>
                            </div>

                            {/* Volume (optional) */}
                            {showVolume && (
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-tighter">24h Vol</span>
                                    <span className="text-[10px] font-bold text-[var(--accent-yellow)] terminal-text">
                                        ${volume.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Graduation Progress */}
                        {!token.is_graduated && (
                            <div className="mt-auto pt-2 border-t border-[var(--border)]">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] text-[var(--text-muted)] font-bold">BONDING CURVE</span>
                                    <span className="text-[9px] text-white font-bold">{progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${progress > 80 ? 'bg-green-500' :
                                                progress > 50 ? 'bg-[var(--accent-yellow)]' :
                                                    'bg-[var(--accent-orange)]'
                                            }`}
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

                {/* Hover Actions */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--bg-card)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                    <span className="text-[10px] font-bold text-white bg-[var(--accent-orange)] px-3 py-1 rounded-full">
                        VIEW TOKEN →
                    </span>
                </div>
            </div>
        </Link>
    );
}

