'use client';

import { useEffect, useState } from 'react';
import { getAddressTransactions } from '@/lib/hiro';
import { formatAddress, getExplorerTxUrl } from '@/lib/stacks';
import { useWallet } from './WalletProvider';

interface Transaction {
    tx_id: string;
    tx_status: string;
    tx_type: string;
    sender_address: string;
    block_height: number;
    block_time: number;
    fee_rate?: string;
}

interface TransactionHistoryProps {
    address?: string;
    limit?: number;
    showHeader?: boolean;
}

export default function TransactionHistory({
    address: propAddress,
    limit = 10,
    showHeader = true
}: TransactionHistoryProps) {
    const { address: walletAddress } = useWallet();
    const address = propAddress || walletAddress;

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!address) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const txs = await getAddressTransactions(address, limit);
            setTransactions(txs || []);
            setIsLoading(false);
        };

        fetchTransactions();
    }, [address, limit]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-orange-400';
            case 'pending': return 'text-yellow-400';
            case 'failed':
            case 'abort_by_response':
            case 'abort_by_post_condition':
                return 'text-red-400';
            default: return 'text-zinc-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'success': return 'Success';
            case 'pending': return 'Pending';
            case 'abort_by_response': return 'Failed';
            case 'abort_by_post_condition': return 'Failed';
            default: return status;
        }
    };

    const getTxTypeIcon = (type: string) => {
        switch (type) {
            case 'contract_call':
                return (
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                );
            case 'token_transfer':
                return (
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'smart_contract':
                return (
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 rounded-full bg-zinc-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                );
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!address) {
        return (
            <div className="text-center py-12">
                <div className="text-zinc-500">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>Connect wallet to view transactions</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div>
                {showHeader && <h2 className="text-2xl font-bold mb-6">Transaction History</h2>}
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-zinc-800" />
                            <div className="flex-1">
                                <div className="h-4 bg-zinc-800 rounded w-1/3 mb-2" />
                                <div className="h-3 bg-zinc-800 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12">
                {showHeader && <h2 className="text-2xl font-bold mb-6">Transaction History</h2>}
                <div className="text-zinc-500">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No transactions yet</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {showHeader && (
                <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
            )}
            <div className="space-y-2">
                {transactions.map((tx) => (
                    <a
                        key={tx.tx_id}
                        href={getExplorerTxUrl(tx.tx_id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all group"
                    >
                        {getTxTypeIcon(tx.tx_type)}

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-white group-hover:text-purple-300 transition-colors">
                                    {formatAddress(tx.tx_id, 8, 8)}
                                </span>
                                <span className={`text-xs font-medium ${getStatusColor(tx.tx_status)}`}>
                                    {getStatusLabel(tx.tx_status)}
                                </span>
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">
                                {tx.tx_type.replace(/_/g, ' ')} • Block {tx.block_height.toLocaleString()}
                            </div>
                        </div>

                        <div className="text-right text-sm text-zinc-500">
                            {formatTime(tx.block_time)}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
