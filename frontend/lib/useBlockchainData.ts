'use client';

import { useState, useEffect, useCallback } from 'react';
import { CONTRACTS, getContractId } from './contracts';
import { isMainnet } from './stacks';

// Hiro API endpoint
const HIRO_API = isMainnet
    ? 'https://api.hiro.so'
    : 'https://api.testnet.hiro.so';

const DEPLOYER = process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER || 'SP1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX32N685T';

// Types
export interface BlockchainToken {
    tokenId: number;
    name: string;
    symbol: string;
    creator: string;
    bondingCurve: string;
    imageUri?: string;
    description?: string;
    isGraduated: boolean;
    registeredAt: number;
}

export interface PoolData {
    tokenContract: string;
    creator: string;
    tokensSold: number;
    stxReserve: number;
    isGraduated: boolean;
    createdAt: number;
    currentPrice: number;
    marketCap: number;
}

export interface TradeEvent {
    txId: string;
    type: 'buy' | 'sell';
    trader: string;
    tokenContract: string;
    stxAmount: number;
    tokenAmount: number;
    timestamp: number;
    blockHeight: number;
}

// Fetch contract events from Hiro API
async function fetchContractEvents(
    contractAddress: string,
    contractName: string,
    limit: number = 50
): Promise<any[]> {
    try {
        const response = await fetch(
            `${HIRO_API}/extended/v1/contract/${contractAddress}.${contractName}/events?limit=${limit}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(process.env.NEXT_PUBLIC_HIRO_API_KEY && {
                        'x-api-key': process.env.NEXT_PUBLIC_HIRO_API_KEY
                    })
                }
            }
        );

        if (!response.ok) return [];
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching contract events:', error);
        return [];
    }
}

// Parse Clarity value from hex
function parseClarityValue(hex: string): any {
    // Simplified parsing - in production use @stacks/transactions
    try {
        // Remove 0x prefix if present
        const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
        // Basic uint parsing (type 0x01)
        if (cleanHex.startsWith('01')) {
            const valueHex = cleanHex.slice(2);
            return parseInt(valueHex, 16);
        }
        return null;
    } catch {
        return null;
    }
}

// Get registered tokens from launchpad-factory events
export async function getRegisteredTokens(): Promise<BlockchainToken[]> {
    const events = await fetchContractEvents(
        CONTRACTS.launchpadFactory.address,
        CONTRACTS.launchpadFactory.name,
        100
    );

    const tokens: BlockchainToken[] = [];

    for (const event of events) {
        try {
            // Look for token-created events
            if (event.contract_log?.value?.repr?.includes('token-created') ||
                event.event_type === 'smart_contract_log') {

                // Parse event data (simplified)
                const repr = event.contract_log?.value?.repr || '';

                // Extract token info from print event
                const tokenMatch = {
                    tokenId: tokens.length + 1,
                    name: `Token ${tokens.length + 1}`,
                    symbol: `TKN${tokens.length + 1}`,
                    creator: event.tx_id ? DEPLOYER : DEPLOYER,
                    bondingCurve: getContractId('bondingCurve'),
                    isGraduated: false,
                    registeredAt: Date.now()
                };

                tokens.push(tokenMatch);
            }
        } catch (e) {
            console.error('Error parsing token event:', e);
        }
    }

    return tokens;
}

// Get recent trades from bonding-curve events
export async function getRecentTrades(limit: number = 20): Promise<TradeEvent[]> {
    const events = await fetchContractEvents(
        CONTRACTS.bondingCurve.address,
        CONTRACTS.bondingCurve.name,
        limit * 2 // Fetch more to filter
    );

    const trades: TradeEvent[] = [];

    for (const event of events) {
        try {
            const repr = event.contract_log?.value?.repr || '';

            // Check if it's a buy or sell event
            const isBuy = repr.includes('buy') || repr.includes('tokens-bought');
            const isSell = repr.includes('sell') || repr.includes('tokens-sold');

            if (isBuy || isSell) {
                trades.push({
                    txId: event.tx_id || '',
                    type: isBuy ? 'buy' : 'sell',
                    trader: DEPLOYER, // Would parse from event
                    tokenContract: getContractId('launchpadToken'),
                    stxAmount: 0, // Would parse from event
                    tokenAmount: 0, // Would parse from event
                    timestamp: new Date(event.block_time_iso || Date.now()).getTime(),
                    blockHeight: event.block_height || 0
                });
            }
        } catch (e) {
            console.error('Error parsing trade event:', e);
        }
    }

    return trades.slice(0, limit);
}

// Get pool info for a token
export async function getPoolInfo(tokenContract: string): Promise<PoolData | null> {
    try {
        const [tokenAddress, tokenName] = tokenContract.split('.');
        const contractId = getContractId('bondingCurve');

        const response = await fetch(
            `${HIRO_API}/v2/contracts/call-read/${CONTRACTS.bondingCurve.address}/${CONTRACTS.bondingCurve.name}/get-pool-info`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: DEPLOYER,
                    arguments: [`0x0616${tokenAddress}${tokenName}`] // Simplified
                }),
            }
        );

        if (!response.ok) return null;
        const data = await response.json();

        // Parse response (simplified)
        return null; // Would need proper Clarity value parsing
    } catch (error) {
        console.error('Error fetching pool info:', error);
        return null;
    }
}

// Hook to fetch blockchain data
export function useBlockchainData() {
    const [tokens, setTokens] = useState<BlockchainToken[]>([]);
    const [trades, setTrades] = useState<TradeEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [tokenData, tradeData] = await Promise.all([
                getRegisteredTokens(),
                getRecentTrades(20)
            ]);

            setTokens(tokenData);
            setTrades(tradeData);
        } catch (e) {
            setError('Failed to fetch blockchain data');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return {
        tokens,
        trades,
        loading,
        error,
        refresh: fetchData
    };
}

// Hook for real-time trade updates
export function useRecentTrades(limit: number = 10) {
    const [trades, setTrades] = useState<TradeEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchTrades = async () => {
            const data = await getRecentTrades(limit);
            if (mounted) {
                setTrades(data);
                setLoading(false);
            }
        };

        fetchTrades();
        const interval = setInterval(fetchTrades, 15000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [limit]);

    return { trades, loading };
}
