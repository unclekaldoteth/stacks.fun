'use client';

import Link from 'next/link';
import { Token, getProgressToGraduation } from '@/lib/api';
import { formatAddress } from '@/lib/stacks';

interface KingOfTheHillProps {
    token: Token;
}

export default function KingOfTheHill({ token }: KingOfTheHillProps) {
    const progress = getProgressToGraduation(token.market_cap);

    return (
        <Link href={`/token/${token.symbol}`}>
            <section className="koth-section group cursor-pointer hover:border-[rgba(234,179,8,0.4)] transition-all">
                <div className="koth-badge">
                    <span>👑</span>
                    <span>KING OF THE HILL</span>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Image */}
                    <div className="w-40 h-40 flex-shrink-0 bg-black border-2 border-[var(--accent-yellow)] rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.1)] group-hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all">
                        {token.image_uri ? (
                            <img
                                src={token.image_uri}
                                alt={token.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-[var(--accent-yellow)]">
                                {token.symbol[0]}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="mb-4">
                            <h2 className="text-3xl font-black text-white mb-2 group-hover:text-[var(--accent-yellow)] transition-colors">
                                {token.name} <span className="text-[var(--text-muted)] terminal-text">[${token.symbol}]</span>
                            </h2>
                            <p className="text-sm text-[var(--text-secondary)]">
                                created by <span className="text-blue-400">{formatAddress(token.creator, 8, 8)}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <span className="pump-label">Market Cap</span>
                                <div className="text-2xl font-black text-[var(--accent-orange)] terminal-text">
                                    ${token.market_cap.toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <span className="pump-label">Graduation</span>
                                <div className="text-2xl font-black text-white terminal-text">
                                    {progress.toFixed(1)}%
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <span className="pump-label">Price</span>
                                <div className="text-2xl font-black text-white terminal-text">
                                    ${token.current_price.toFixed(6)}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-4 bg-black rounded-full overflow-hidden border-2 border-[var(--border)]">
                            <div
                                className="h-full bg-gradient-to-r from-[var(--accent-yellow)] to-[var(--accent-orange)] shadow-[0_0_10px_rgba(247,147,26,0.3)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="mt-2 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest text-center md:text-left">
                            ALEX Graduation Threshold: $69,000 Market Cap
                        </p>
                    </div>
                </div>
            </section>
        </Link>
    );
}
