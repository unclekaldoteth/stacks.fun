'use client';

import { useState, useMemo } from 'react';
import { calculateBuyAmount, calculateSellReturn, Token } from '@/lib/api';
import { buyTokens, sellTokens } from '@/lib/contracts';
import { getExplorerTxUrl } from '@/lib/stacks';

interface TradePanelProps {
    token: Token;
    userBalance?: number;
    userStxBalance?: number;
    onTradeComplete?: () => void;
}

type TradeMode = 'buy' | 'sell';

export default function TradePanel({
    token,
    userBalance = 0,
    userStxBalance = 0,
    onTradeComplete
}: TradePanelProps) {
    const [mode, setMode] = useState<TradeMode>('buy');
    const [amount, setAmount] = useState<string>('');
    const [slippage, setSlippage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showSlippage, setShowSlippage] = useState(false);
    const [txId, setTxId] = useState<string | null>(null);

    const numAmount = parseFloat(amount) || 0;

    const expectedOutput = useMemo(() => {
        if (mode === 'buy') {
            return calculateBuyAmount(numAmount, token.tokens_sold);
        } else {
            return calculateSellReturn(numAmount, token.tokens_sold);
        }
    }, [mode, numAmount, token.tokens_sold]);

    const minOutput = expectedOutput * (1 - slippage / 100);

    const handleTrade = async () => {
        if (!numAmount || token.is_graduated) return;

        setIsLoading(true);
        setTxId(null);

        try {
            // Use the bonding-curve contract with the launchpad-token contract
            // All tokens share the same bonding-curve, identified by the launchpad-token contract
            const DEPLOYER = process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER || 'ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM';
            const tokenContractId = `${DEPLOYER}.launchpad-token`;

            if (mode === 'buy') {
                // Buy tokens with STX
                await buyTokens(
                    tokenContractId,
                    numAmount, // STX amount
                    minOutput, // Minimum tokens to receive
                    {
                        onFinish: (data) => {
                            setTxId(data.txId);
                            setAmount('');
                            onTradeComplete?.();
                        },
                        onCancel: () => {
                            setIsLoading(false);
                        },
                    }
                );
            } else {
                // Sell tokens for STX
                await sellTokens(
                    tokenContractId,
                    numAmount, // Token amount
                    minOutput, // Minimum STX to receive
                    {
                        onFinish: (data) => {
                            setTxId(data.txId);
                            setAmount('');
                            onTradeComplete?.();
                        },
                        onCancel: () => {
                            setIsLoading(false);
                        },
                    }
                );
            }
        } catch (error) {
            console.error('Trade failed:', error);
            alert('Trade failed. Please try again or check your wallet.');
        } finally {
            setIsLoading(false);
        }
    };

    const setQuickAmount = (val: string) => {
        setAmount(val);
    };

    const isDisabled = !numAmount || isLoading || token.is_graduated;

    return (
        <div className="pump-panel bg-black border-[var(--border-bright)]">
            {/* Mode Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setMode('buy')}
                    className={`flex-1 py-3 font-black text-sm transition-all rounded-lg border-2 ${mode === 'buy'
                        ? 'bg-[var(--accent-orange)] text-black border-[var(--accent-orange)]'
                        : 'bg-transparent text-[var(--accent-orange)] border-[var(--accent-orange)] hover:bg-[var(--accent-orange)] hover:text-black'
                        }`}
                >
                    BUY
                </button>
                <button
                    onClick={() => setMode('sell')}
                    className={`flex-1 py-3 font-black text-sm transition-all rounded-lg border-2 ${mode === 'sell'
                        ? 'bg-[var(--accent-red)] text-black border-[var(--accent-red)]'
                        : 'bg-transparent text-[var(--accent-red)] border-[var(--accent-red)] hover:bg-[var(--accent-red)] hover:text-black'
                        }`}
                >
                    SELL
                </button>
            </div>

            {/* Input Container */}
            <div className="mb-6 relative">
                <div className="flex justify-between items-center mb-1">
                    <span className="pump-label">amount</span>
                    <button
                        onClick={() => setShowSlippage(!showSlippage)}
                        className="text-[10px] text-[var(--text-muted)] hover:text-white terminal-text"
                    >
                        [slippage: {slippage}%]
                    </button>
                </div>

                {showSlippage && (
                    <div className="flex gap-2 mb-3 p-2 bg-zinc-900 rounded border border-[var(--border)]">
                        {[0.5, 1, 3, 5].map(s => (
                            <button
                                key={s}
                                onClick={() => { setSlippage(s); setShowSlippage(false); }}
                                className={`flex-1 text-[10px] py-1 rounded ${slippage === s ? 'bg-white text-black' : 'text-white'}`}
                            >
                                {s}%
                            </button>
                        ))}
                    </div>
                )}

                <div className="relative">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        className="w-full bg-zinc-900 border-2 border-[var(--border)] rounded-lg px-4 py-4 text-2xl font-black terminal-text focus:outline-none focus:border-white transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-black text-sm">
                        {mode === 'buy' ? 'STX' : token.symbol}
                    </div>
                </div>

                {/* Quick Buttons */}
                <div className="flex gap-2 mt-3">
                    {mode === 'buy' ? (
                        ['10', '50', '100', '500'].map(v => (
                            <button
                                key={v}
                                onClick={() => setQuickAmount(v)}
                                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] py-2 rounded font-bold border border-[var(--border)]"
                            >
                                {v} STX
                            </button>
                        ))
                    ) : (
                        ['25', '50', '75', '100'].map(v => (
                            <button
                                key={v}
                                onClick={() => setQuickAmount((userBalance * parseInt(v) / 100).toString())}
                                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] py-2 rounded font-bold border border-[var(--border)]"
                            >
                                {v}%
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Quote */}
            {numAmount > 0 && (
                <div className="mb-6 p-4 bg-zinc-900/50 rounded-lg border border-dashed border-[var(--border)] terminal-text text-[11px]">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[var(--text-muted)]">receiving</span>
                        <span className="text-white font-bold">{expectedOutput.toLocaleString()} {mode === 'buy' ? token.symbol : 'STX'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">slippage (max)</span>
                        <span className="text-white font-bold">{minOutput.toLocaleString()}</span>
                    </div>
                </div>
            )}

            {/* Action Button */}
            <button
                onClick={handleTrade}
                disabled={isDisabled}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all border-b-4 active:border-b-2 active:translate-y-0.5 ${isDisabled
                    ? 'bg-zinc-800 text-zinc-600 border-zinc-900 cursor-not-allowed'
                    : mode === 'buy'
                        ? 'bg-[var(--accent-orange)] text-black border-orange-700 hover:bg-orange-400'
                        : 'bg-[var(--accent-red)] text-black border-red-700 hover:bg-red-400'
                    }`}
            >
                {isLoading ? 'EXECUTING...' : `[PLACE ${mode === 'buy' ? 'BUY' : 'SELL'} ORDER]`}
            </button>

            {/* Footer Tip */}
            <div className="mt-4 text-[9px] text-[var(--text-muted)] text-center font-bold uppercase tracking-widest leading-normal">
                tip: only trade coins you find cool. <br />
                all trades are final on the blockchain.
            </div>
        </div>
    );
}
