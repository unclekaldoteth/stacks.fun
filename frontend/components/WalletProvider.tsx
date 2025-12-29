'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { WALLETCONNECT_PROJECT_ID, NETWORK } from '@/config';
import { getSTXBalance } from '@/lib/hiro';

interface WalletContextType {
    isConnected: boolean;
    address: string | null;
    balance: string | null;
    isLoading: boolean;
    isConnecting: boolean; // alias for isLoading
    isMainnet: boolean;
    connectWallet: () => Promise<void>;
    connect: () => Promise<void>; // alias for connectWallet
    disconnect: () => void;
    refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const isMainnet = NETWORK === 'mainnet';

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Check for existing session on mount
    useEffect(() => {
        if (!isClient) return;

        const checkSession = async () => {
            try {
                const { getLocalStorage } = await import('@stacks/connect');
                const userData = getLocalStorage();
                if (userData?.addresses?.stx?.[0]?.address) {
                    const addr = userData.addresses.stx[0].address;
                    setIsConnected(true);
                    setAddress(addr);
                    // Fetch balance
                    const bal = await getSTXBalance(addr);
                    if (bal) setBalance(bal);
                }
            } catch (err) {
                console.error('Failed to check session:', err);
            }
        };
        checkSession();
    }, [isClient]);

    const refreshBalance = useCallback(async () => {
        if (address) {
            const bal = await getSTXBalance(address);
            if (bal) setBalance(bal);
        }
    }, [address]);

    const connectWallet = useCallback(async () => {
        if (!isClient || typeof window === 'undefined') return;

        setIsLoading(true);
        try {
            const { connect, getLocalStorage } = await import('@stacks/connect');

            // Key configuration for WalletConnect to work:
            // - walletConnectProjectId: Required for WalletConnect option
            // - network: Required to avoid 'network in undefined' error
            await connect({
                walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
                network: isMainnet ? 'mainnet' : 'testnet',
            });

            // Get address from localStorage after connection
            const userData = getLocalStorage();
            if (userData?.addresses?.stx?.[0]?.address) {
                const addr = userData.addresses.stx[0].address;
                setIsConnected(true);
                setAddress(addr);
                // Fetch balance
                const bal = await getSTXBalance(addr);
                if (bal) setBalance(bal);
            }
        } catch (err) {
            console.error('Failed to connect wallet:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isClient, isMainnet]);

    const disconnect = useCallback(async () => {
        try {
            const { disconnect: stacksDisconnect } = await import('@stacks/connect');
            await stacksDisconnect();
            setIsConnected(false);
            setAddress(null);
            setBalance(null);
        } catch (err) {
            console.error('Failed to disconnect:', err);
        }
    }, []);

    return (
        <WalletContext.Provider value={{
            isConnected,
            address,
            balance,
            isLoading,
            isConnecting: isLoading, // alias
            isMainnet,
            connectWallet,
            connect: connectWallet, // alias
            disconnect,
            refreshBalance
        }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        // Return safe defaults for SSR
        const noop = async () => { };
        return {
            isConnected: false,
            address: null,
            balance: null,
            isLoading: false,
            isConnecting: false,
            isMainnet: NETWORK === 'mainnet',
            connectWallet: noop,
            connect: noop,
            disconnect: () => { },
            refreshBalance: noop,
        };
    }
    return context;
}

// Shorthand hooks
export function useIsConnected() {
    const { isConnected } = useWallet();
    return isConnected;
}

export function useAddress() {
    const { address } = useWallet();
    return address;
}

// Format address for display
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
    if (!address || address.length < startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
