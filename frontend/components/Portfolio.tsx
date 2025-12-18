'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/components/WalletProvider';
import { formatAddress, getExplorerAddressUrl } from '@/lib/stacks';
import { isMainnet } from '@/lib/stacks';

interface TokenHolding {
    contractId: string;
    name: string;
    symbol: string;
    balance: number;
    decimals: number;
    price: number;
    valueStx: number;
    change24h: number;
    imageUri?: string;
}

interface PortfolioProps {
    showHeader?: boolean;
}

const HIRO_API = isMainnet
    ? 'https://api.hiro.so'
    : 'https://api.testnet.hiro.so';

export default function Portfolio({ showHeader = true }: PortfolioProps) {
    const { address, isConnected } = useWallet();
    const [holdings, setHoldings] = useState<TokenHolding[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalValue, setTotalValue] = useState(0);

    useEffect(() => {
        if (!address) {
            setLoading(false);
            return;
        }

        fetchHoldings();
    }, [address]);

    async function fetchHoldings() {
        if (!address) return;

        setLoading(true);
        try {
            // Fetch fungible token balances from Hiro API
            const response = await fetch(
                `${HIRO_API}/extended/v1/address/${address}/balances`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(process.env.NEXT_PUBLIC_HIRO_API_KEY && {
                            'x-api-key': process.env.NEXT_PUBLIC_HIRO_API_KEY
                        })
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch balances');
            }

            const data = await response.json();
            const fungibleTokens = data.fungible_tokens || {};

            // Parse token holdings
            const parsedHoldings: TokenHolding[] = [];
            let total = 0;

            for (const [contractId, tokenData] of Object.entries(fungibleTokens)) {
                const data = tokenData as { balance: string };
                const balance = parseInt(data.balance) / 100_000_000; // Assuming 8 decimals

                if (balance <= 0) continue;

                // Extract token info from contract ID
                const [contractAddress, contractName] = contractId.split('::')[0].split('.');
                const symbol = contractName?.toUpperCase().slice(0, 5) || 'TKN';

                // Mock price data (in production, fetch from bonding curve or price oracle)
                const mockPrice = Math.random() * 0.1;
                const valueStx = balance * mockPrice;
                const change24h = (Math.random() - 0.5) * 20;

                total += valueStx;

                parsedHoldings.push({
                    contractId,
                    name: contractName || 'Unknown Token',
                    symbol,
                    balance,
                    decimals: 8,
                    price: mockPrice,
                    valueStx,
                    change24h
                });
            }

            // Sort by value
            parsedHoldings.sort((a, b) => b.valueStx - a.valueStx);

            setHoldings(parsedHoldings);
            setTotalValue(total);
        } catch (error) {
            console.error('Error fetching holdings:', error);
        } finally {
            setLoading(false);
        }
    }

    if (!isConnected) {
        return (
            <div className="pump-panel text-center py-8">
                <div className="text-3xl mb-3">👛</div>
                <p className="text-[var(--text-muted)] text-sm">Connect your wallet to view holdings</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="pump-panel">
                {showHeader && (
                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--accent-orange)] mb-4">
                        Portfolio
                    </h3>
                )}
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-zinc-900 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="pump-panel">
            {showHeader && (
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--accent-orange)]">
                        My Portfolio
                    </h3>
                    <a
                        href={getExplorerAddressUrl(address!)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[var(--text-muted)] hover:text-white transition-colors"
                    >
                        [view on explorer]
                    </a>
                </div>
            )}

            {/* Total Value */}
            <div className="mb-6 p-4 bg-gradient-to-r from-[var(--accent-orange)]/10 to-transparent rounded-lg border border-[var(--accent-orange)]/20">
                <span className="pump-label">Total Value</span>
                <div className="text-2xl font-black text-[var(--accent-orange)] terminal-text">
                    {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} STX
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-1">
                    {holdings.length} token{holdings.length !== 1 ? 's' : ''} in wallet
                </div>
            </div>

            {/* Holdings List */}
            {holdings.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                    <div className="text-2xl mb-2">📭</div>
                    <p className="text-sm">No token holdings found</p>
                    <Link href="/" className="text-[var(--accent-orange)] hover:underline text-xs mt-2 inline-block">
                        [explore tokens →]
                    </Link>
                </div>
            ) : (
                <div className="space-y-2">
                    {holdings.map((token) => (
                        <div
                            key={token.contractId}
                            className="flex items-center gap-3 p-3 rounded-lg bg-black/50 hover:bg-zinc-900 transition-colors border border-transparent hover:border-[var(--border)]"
                        >
                            {/* Token Icon */}
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                                {token.imageUri ? (
                                    <img src={token.imageUri} alt={token.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold text-[var(--text-muted)]">{token.symbol[0]}</span>
                                )}
                            </div>

                            {/* Token Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white truncate">{token.name}</span>
                                    <span className="text-[10px] text-[var(--text-muted)] terminal-text">${token.symbol}</span>
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)]">
                                    {token.balance.toLocaleString()} tokens
                                </div>
                            </div>

                            {/* Value & Change */}
                            <div className="text-right">
                                <div className="text-xs font-bold text-white terminal-text">
                                    {token.valueStx.toFixed(2)} STX
                                </div>
                                <div className={`text-[10px] font-bold ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {token.change24h >= 0 ? '↑' : '↓'}{Math.abs(token.change24h).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Refresh Button */}
            <button
                onClick={fetchHoldings}
                className="mt-4 w-full py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-white border border-[var(--border)] rounded-lg hover:border-[var(--accent-orange)] transition-all"
            >
                [refresh holdings]
            </button>
        </div>
    );
}
