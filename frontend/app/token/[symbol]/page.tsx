'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BondingCurveChart from '@/components/BondingCurveChart';
import TradePanel from '@/components/TradePanel';
import { Token, Trade, getToken, getTokenTrades } from '@/lib/api';
import { formatAddress, getExplorerAddressUrl, getExplorerTxUrl } from '@/lib/stacks';

export default function TokenDetailPage() {
    const params = useParams();
    const symbol = params.symbol as string;

    const [token, setToken] = useState<Token | null>(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'trades' | 'comments'>('trades');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const tokenData = await getToken(symbol);
                setToken(tokenData);

                if (tokenData) {
                    const tradesData = await getTokenTrades(tokenData.id);
                    setTrades(tradesData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        if (symbol) fetchData();
    }, [symbol]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="terminal-text text-[var(--accent-orange)] animate-pulse font-black">INITIALIZING SYSTEM...</div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
                <div className="text-4xl mb-4">🚫</div>
                <h1 className="text-2xl font-black terminal-text text-white">404: COIN NOT FOUND</h1>
                <Link href="/" className="btn-pump btn-pump-primary text-xs uppercase">
                    [return to docking station]
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--bg-primary)] text-white pb-20">
            <div className="main-container py-8">
                {/* Back Nav */}
                <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white mb-8 transition-colors">
                    [← back to terminal]
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Chart & Info (Col 8) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Hero Header */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-32 h-32 flex-shrink-0 bg-black border-2 border-[var(--border-bright)] rounded-2xl overflow-hidden shadow-2xl relative">
                                {token.image_uri ? (
                                    <img src={token.image_uri} alt={token.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[var(--text-muted)]">{token.symbol[0]}</div>
                                )}
                                {token.is_graduated && (
                                    <div className="absolute top-2 right-2 bg-[var(--accent-orange)] text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg">
                                        GRAD
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                    <h1 className="text-4xl font-black text-white italic tracking-tighter">{token.name}</h1>
                                    <span className="text-xl text-[var(--text-muted)] terminal-text">[${token.symbol}]</span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                                    <div className="flex items-center gap-1">
                                        CREATED BY: <span className="text-blue-400 hover:underline">{formatAddress(token.creator, 6, 6)}</span>
                                    </div>
                                    <div>|</div>
                                    <div className="flex items-center gap-1">
                                        CAP: <span className="text-[var(--accent-orange)]">{token.market_cap.toLocaleString()} STX</span>
                                    </div>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic border-l-4 border-[var(--border)] pl-4 py-1">
                                    {token.description || "The creator was too busy mooning to write a description."}
                                </p>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <BondingCurveChart
                            tokensSold={token.tokens_sold}
                            marketCap={token.market_cap}
                            currentPrice={token.current_price}
                            symbol={token.symbol}
                        />

                        {/* Tabs & Content */}
                        <div className="pump-panel">
                            <div className="flex gap-4 border-b border-[var(--border)] mb-6">
                                <button
                                    onClick={() => setActiveTab('trades')}
                                    className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'trades' ? 'text-white' : 'text-[var(--text-muted)] hover:text-white'}`}
                                >
                                    trades
                                    {activeTab === 'trades' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent-orange)]" />}
                                </button>
                                <button
                                    onClick={() => setActiveTab('comments')}
                                    className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'comments' ? 'text-white' : 'text-[var(--text-muted)] hover:text-white'}`}
                                >
                                    comments
                                    {activeTab === 'comments' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent-orange)]" />}
                                </button>
                            </div>

                            {activeTab === 'trades' ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider px-2 mb-2">
                                        <div className="col-span-1">account</div>
                                        <div className="col-span-1">type</div>
                                        <div className="col-span-1 text-right">STX</div>
                                        <div className="col-span-1 text-right">amount</div>
                                        <div className="col-span-1 text-right">time</div>
                                    </div>
                                    {trades.map((trade) => (
                                        <div key={trade.id} className="grid grid-cols-5 items-center text-[11px] p-2 hover:bg-zinc-900 rounded transition-colors group">
                                            <div className="col-span-1 text-blue-400 font-bold">{formatAddress(trade.trader, 4, 4)}</div>
                                            <div className="col-span-1">
                                                <span className={`font-black uppercase tracking-tighter ${trade.trade_type === 'buy' ? 'text-[var(--accent-orange)]' : 'text-[var(--accent-red)]'}`}>
                                                    {trade.trade_type}
                                                </span>
                                            </div>
                                            <div className="col-span-1 text-right text-white font-medium">{trade.stx_amount.toFixed(2)}</div>
                                            <div className="col-span-1 text-right text-[var(--text-secondary)]">{(trade.token_amount / 1000).toFixed(1)}k</div>
                                            <div className="col-span-1 text-right text-[var(--text-muted)]">
                                                <a href={getExplorerTxUrl(trade.tx_id)} target="_blank" className="hover:text-white underline">{new Date(trade.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</a>
                                            </div>
                                        </div>
                                    ))}
                                    {trades.length === 0 && <div className="text-center py-12 text-[var(--text-muted)] italic text-xs uppercase">no signal detected...</div>}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="text-4xl mb-4 opacity-20">💬</div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">communications offline</h3>
                                    <p className="text-[10px] text-[var(--text-secondary)] mt-2">commenting system is currently in orbit.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Trading (Col 4) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            <TradePanel
                                token={token}
                                userStxBalance={100}
                                onTradeComplete={() => {
                                    getToken(symbol).then(setToken);
                                    getTokenTrades(token.id).then(setTrades);
                                }}
                            />

                            {/* Token Metadata Panel */}
                            <div className="pump-panel bg-black/40 border-[var(--border)]">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 pb-2 border-b border-[var(--border)]">contract info</h3>
                                <div className="space-y-4 text-[11px] terminal-text">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--text-muted)] uppercase">address</span>
                                        <a href={getExplorerAddressUrl(token.contract_address)} target="_blank" className="text-blue-400 hover:underline">{formatAddress(token.contract_address, 6, 6)}</a>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--text-muted)] uppercase">supply</span>
                                        <span className="text-white">1,000,000,000</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--text-muted)] uppercase">launch date</span>
                                        <span className="text-white">{new Date(token.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
