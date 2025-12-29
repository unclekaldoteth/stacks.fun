'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { WALLETCONNECT_PROJECT_ID, NETWORK } from '@/config';
import { getSTXBalance } from '@/lib/hiro';

interface WalletContextType {
    isConnected: boolean;
    address: string | null;
    balance: string | null;
    isLoading: boolean;
    isConnecting: boolean;
    isMainnet: boolean;
    connectWallet: () => Promise<void>;
    connect: () => Promise<void>;
    disconnect: () => void;
    refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

// Helper function to select the correct address based on network
// Mainnet addresses start with 'SP', testnet addresses start with 'ST'
function getAddressForNetwork(addresses: { address: string }[] | undefined, isMainnet: boolean): string | null {
    if (!addresses || addresses.length === 0) return null;

    const prefix = isMainnet ? 'SP' : 'ST';
    const matchingAddress = addresses.find(addr => addr.address.startsWith(prefix));

    if (matchingAddress) {
        return matchingAddress.address;
    }

    // Fallback: return first address if no matching prefix found
    console.warn(`No ${isMainnet ? 'mainnet' : 'testnet'} address found, using first available address`);
    return addresses[0]?.address || null;
}

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

                if (userData?.addresses?.stx && userData.addresses.stx.length > 0) {
                    const addr = getAddressForNetwork(userData.addresses.stx, isMainnet);

                    if (addr) {
                        setIsConnected(true);
                        setAddress(addr);
                        const bal = await getSTXBalance(addr);
                        if (bal) setBalance(bal);
                    }
                }
            } catch (err) {
                console.error('Failed to check session:', err);
            }
        };
        checkSession();
    }, [isClient, isMainnet]);

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

            await connect({
                walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
                network: isMainnet ? 'mainnet' : 'testnet',
            });

            const userData = getLocalStorage();

            if (userData?.addresses?.stx && userData.addresses.stx.length > 0) {
                const addr = getAddressForNetwork(userData.addresses.stx, isMainnet);

                if (addr) {
                    setIsConnected(true);
                    setAddress(addr);
                    const bal = await getSTXBalance(addr);
                    if (bal) setBalance(bal);
                }
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
            isConnecting: isLoading,
            isMainnet,
            connectWallet,
            connect: connectWallet,
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

export function useIsConnected() {
    const { isConnected } = useWallet();
    return isConnected;
}

export function useAddress() {
    const { address } = useWallet();
    return address;
}

export function formatAddress(address: string, startChars = 6, endChars = 4): string {
    if (!address || address.length < startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
