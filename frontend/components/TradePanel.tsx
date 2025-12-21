'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { calculateBuyAmount, calculateSellReturn, Token } from '@/lib/api';
import { buyTokens, sellTokens, CONTRACTS } from '@/lib/contracts';
import { useWallet } from '@/components/WalletProvider';

interface TradePanelProps {
    token: Token;
    onTradeComplete?: () => void;
}

type TradeMode = 'buy' | 'sell';

const DEPLOYER = process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER || 'ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM';
const STACKS_API = process.env.NEXT_PUBLIC_STACKS_API || 'https://api.testnet.hiro.so';

// USDCx contract on testnet
const USDCX_CONTRACT = `${CONTRACTS.usdcx.address}.${CONTRACTS.usdcx.name}`;

export default function TradePanel({
    token,
    onTradeComplete
}: TradePanelProps) {
    const { isConnected, address } = useWallet();
    const [mode, setMode] = useState<TradeMode>('buy');
    const [amount, setAmount] = useState<string>('');
    const [slippage, setSlippage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showSlippage, setShowSlippage] = useState(false);
    const [txId, setTxId] = useState<string | null>(null);
    const [usdcBalance, setUsdcBalance] = useState<number>(0);
    const [tokenBalance, setTokenBalance] = useState<number>(0);
    const [balanceLoading, setBalanceLoading] = useState(false);

    // Fetch both USDCx and token balances
    const fetchBalances = useCallback(async () => {
        if (!address) {
            setUsdcBalance(0);
            setTokenBalance(0);
            return;
        }

        setBalanceLoading(true);

        try {
            const tx = await import('@stacks/transactions');

            // 1. Fetch USDCx balance from contract
            const usdcxArgs = [tx.cvToHex(tx.standardPrincipalCV(address))];
            const usdcResponse = await fetch(
                `${STACKS_API}/v2/contracts/call-read/${CONTRACTS.usdcx.address}/${CONTRACTS.usdcx.name}/get-balance`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sender: address,
                        arguments: usdcxArgs,
                    }),
                }
            );

            if (usdcResponse.ok) {
                const usdcData = await usdcResponse.json();
                if (usdcData.okay && usdcData.result) {
                    const cv = tx.hexToCV(usdcData.result);
                    const value = tx.cvToValue(cv);
                    // USDCx has 6 decimals
                    const balance = typeof value === 'object' && 'value' in value
                        ? parseInt(String(value.value), 10) / 1_000_000
                        : 0;
                    setUsdcBalance(balance);
                    console.log('USDCx balance:', balance);
                }
            }

            // 2. Fetch token balance from bonding-curve contract
            try {
                const { getUserBalance } = await import('@/lib/contracts');
                const tokenContract = `${DEPLOYER}.launchpad-token`;
                const balance = await getUserBalance(tokenContract, address);
                setTokenBalance(balance);
                console.log('Token balance fetched:', balance);
            } catch (tokenError) {
                console.error('Error fetching token balance:', tokenError);
                setTokenBalance(0);
            }
        } catch (error) {
            console.error('Error fetching balances:', error);
        } finally {
            setBalanceLoading(false);
        }
    }, [address]);

    // Fetch balances on mount and when address/txId changes
    useEffect(() => {
        fetchBalances();
    }, [address, txId, fetchBalances]);

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

        if (!isConnected || !address) {
            alert('Please connect your wallet to trade.');
            return;
        }

        setIsLoading(true);
        setTxId(null);

        try {
            const DEPLOYER = process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER || 'ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM';
            const tokenContractId = `${DEPLOYER}.launchpad-token`;

            // Check if pool exists on bonding-curve-v2, create if not
            const { getPoolInfo, createPool } = await import('@/lib/contracts');
            const poolInfo = await getPoolInfo(tokenContractId);

            if (!poolInfo) {
                // Pool doesn't exist on v2 - need to create it first
                alert('Creating pool on bonding-curve-v2. Please approve the transaction, then try trading again.');
                await createPool(tokenContractId, address, {
                    onFinish: (data) => {
                        console.log('Pool created on v2:', data.txId);
                        alert('Pool creation submitted! Wait ~30 seconds for it to confirm, then try your trade again.');
                        setIsLoading(false);
                    },
                    onCancel: () => {
                        setIsLoading(false);
                    },
                });
                return;
            }

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
            setAmount((usdcBalance * percent / 100).toFixed(2));
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
                    {mode === 'buy' ? 'USDC Balance' : `${token.symbol} Balance`}
                </span>
                <span className="text-[11px] text-white font-bold terminal-text">
                    {balanceLoading ? '...' : mode === 'buy'
                        ? `${usdcBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`
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
                    <div className="mb-3 p-3 bg-zinc-900 rounded border border-[var(--border)]">
                        <div className="flex gap-2 mb-2">
                            {[0.5, 1, 3, 5, 10].map(s => (
                                <button
                                    key={s}
                                    onClick={() => { setSlippage(s); setShowSlippage(false); }}
                                    className={`flex-1 text-[10px] py-1.5 rounded font-bold ${slippage === s ? 'bg-[var(--accent-orange)] text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                                >
                                    {s}%
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-[var(--text-muted)]">Custom:</span>
                            <input
                                type="number"
                                min="0.1"
                                max="50"
                                step="0.1"
                                value={slippage}
                                onChange={(e) => setSlippage(Math.min(50, Math.max(0.1, parseFloat(e.target.value) || 1)))}
                                className="flex-1 bg-zinc-800 border border-[var(--border)] rounded px-2 py-1 text-[11px] text-white font-mono w-16"
                            />
                            <span className="text-[10px] text-[var(--text-muted)]">%</span>
                            <button
                                onClick={() => setShowSlippage(false)}
                                className="text-[10px] bg-[var(--accent-orange)] text-black px-3 py-1 rounded font-bold"
                            >
                                OK
                            </button>
                        </div>
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

