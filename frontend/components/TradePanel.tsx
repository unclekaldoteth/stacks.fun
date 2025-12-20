'use client';

import { useState, useMemo, useEffect } from 'react';
import { calculateBuyAmount, calculateSellReturn, Token } from '@/lib/api';
import { buyTokens, sellTokens } from '@/lib/contracts';
import { getExplorerTxUrl } from '@/lib/stacks';
import { useWallet } from '@/components/WalletProvider';

interface TradePanelProps {
    token: Token;
    onTradeComplete?: () => void;
}

type TradeMode = 'buy' | 'sell';

export default function TradePanel({
    token,
    onTradeComplete
}: TradePanelProps) {
    const { balance: stxBalance, isConnected, address } = useWallet();
    const [mode, setMode] = useState<TradeMode>('buy');
    const [amount, setAmount] = useState<string>('');
    const [slippage, setSlippage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showSlippage, setShowSlippage] = useState(false);
    const [txId, setTxId] = useState<string | null>(null);
    const [tokenBalance, setTokenBalance] = useState<number>(0);

    // Parse STX balance from wallet (format: "499.123456 STX")
    const userStxBalance = useMemo(() => {
        if (!stxBalance) return 0;
        const match = stxBalance.match(/^([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
    }, [stxBalance]);

    // Fetch user's token balance from the bonding curve contract
    useEffect(() => {
        async function fetchTokenBalance() {
            if (!address) {
                setTokenBalance(0);
                return;
            }

            try {
                const DEPLOYER = process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER || 'ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM';
                const tokenContract = `${DEPLOYER}.launchpad-token`;

                // Import the getUserBalance function from contracts
                const { getUserBalance } = await import('@/lib/contracts');
                const balance = await getUserBalance(tokenContract, address);
                setTokenBalance(balance);
            } catch (error) {
                console.error('Error fetching token balance:', error);
                setTokenBalance(0);
            }
        }

        fetchTokenBalance();
    }, [address, txId]); // Refresh after trade

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

        if (!isConnected) {
            alert('Please connect your wallet to trade.');
            return;
        }

        setIsLoading(true);
        setTxId(null);

        try {
            const DEPLOYER = process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER || 'ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM';
            const tokenContractId = `${DEPLOYER}.launchpad-token`;

            if (mode === 'buy') {
                await buyTokens(
                    tokenContractId,
                    numAmount,
                    minOutput,
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
                await sellTokens(
                    tokenContractId,
                    numAmount,
                    minOutput,
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

    const setPercentage = (percent: number) => {
        if (mode === 'sell') {
            setAmount((tokenBalance * percent / 100).toFixed(2));
        } else {
            setAmount((userStxBalance * percent / 100).toFixed(2));
        }
    };

    const isDisabled = !numAmount || isLoading || token.is_graduated || !isConnected;

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

            {/* Balance Display */}
            <div className="flex justify-between items-center mb-3 px-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold">
                    {mode === 'buy' ? 'STX Balance' : `${token.symbol} Balance`}
                </span>
                <span className="text-[11px] text-white font-bold terminal-text">
                    {mode === 'buy'
                        ? `${userStxBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} STX`
                        : `${tokenBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${token.symbol}`
                    }
                </span>
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
                                onClick={() => setAmount(v)}
                                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] py-2 rounded font-bold border border-[var(--border)]"
                            >
                                {v} STX
                            </button>
                        ))
                    ) : (
                        [25, 50, 75, 100].map(v => (
                            <button
                                key={v}
                                onClick={() => setPercentage(v)}
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
                {!isConnected
                    ? '[CONNECT WALLET]'
                    : isLoading
                        ? 'EXECUTING...'
                        : `[PLACE ${mode === 'buy' ? 'BUY' : 'SELL'} ORDER]`
                }
            </button>

            {/* Footer Tip */}
            <div className="mt-4 text-[9px] text-[var(--text-muted)] text-center font-bold uppercase tracking-widest leading-normal">
                tip: only trade coins you find cool. <br />
                all trades are final on the blockchain.
            </div>
        </div>
    );
}

