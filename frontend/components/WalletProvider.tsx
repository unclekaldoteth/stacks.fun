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
        console.log(`Found ${isMainnet ? 'mainnet' : 'testnet'} address:`, matchingAddress.address);
        return matchingAddress.address;
    }

    // Log all available addresses for debugging
    console.warn(`No ${isMainnet ? 'mainnet (SP)' : 'testnet (ST)'} address found. Available addresses:`, 
        addresses.map(a => a.address));
    
    // Fallback: return first address if no matching prefix found
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
        console.log(`WalletProvider initialized - Network: ${NETWORK}, isMainnet: ${isMainnet}`);
    }, [isMainnet]);

    // Check for existing session on mount
    useEffect(() => {
        if (!isClient) return;

        const checkSession = async () => {
            try {
                const { getLocalStorage } = await import('@stacks/connect');
                const userData = getLocalStorage();

                console.log('Checking existing session, userData:', userData ? 'found' : 'not found');

                if (userData?.addresses?.stx && userData.addresses.stx.length > 0) {
                    const addr = getAddressForNetwork(userData.addresses.stx, isMainnet);

                    if (addr) {
                        // Verify the address matches the expected network
                        const expectedPrefix = isMainnet ? 'SP' : 'ST';
                        if (!addr.startsWith(expectedPrefix)) {
                            console.warn(`Address ${addr} does not match expected network (${NETWORK}). Clearing session.`);
                            // Don't auto-connect with wrong network address
                            return;
                        }

                        setIsConnected(true);
                        setAddress(addr);
                        const bal = await getSTXBalance(addr);
                        if (bal) setBalance(bal);
                        console.log(`Restored session for ${addr} on ${NETWORK}`);
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
        console.log(`Connecting wallet on ${NETWORK}...`);

        try {
            const { connect, getLocalStorage } = await import('@stacks/connect');

            // Build connection options for @stacks/connect v8
            // Note: appDetails is set via openContractCall, not connect()
            const hasWalletConnect = WALLETCONNECT_PROJECT_ID && 
                WALLETCONNECT_PROJECT_ID !== 'your_walletconnect_project_id_here';

            console.log('Connection options:', { 
                network: isMainnet ? 'mainnet' : 'testnet', 
                hasWalletConnect 
            });

            await connect({
                network: isMainnet ? 'mainnet' : 'testnet',
                ...(hasWalletConnect && { walletConnectProjectId: WALLETCONNECT_PROJECT_ID }),
            });

            // Small delay to ensure wallet data is stored
            await new Promise(resolve => setTimeout(resolve, 100));

            const userData = getLocalStorage();
            console.log('Post-connect userData:', userData ? 'found' : 'not found');

            if (userData?.addresses?.stx && userData.addresses.stx.length > 0) {
                console.log('Available STX addresses:', userData.addresses.stx.map((a: { address: string }) => a.address));
                
                const addr = getAddressForNetwork(userData.addresses.stx, isMainnet);

                if (addr) {
                    // Verify address matches network
                    const expectedPrefix = isMainnet ? 'SP' : 'ST';
                    if (!addr.startsWith(expectedPrefix)) {
                        console.error(`Connected with wrong network address: ${addr}. Expected ${expectedPrefix}... for ${NETWORK}`);
                        alert(`Please switch your wallet to ${isMainnet ? 'Mainnet' : 'Testnet'} and try again.`);
                        setIsLoading(false);
                        return;
                    }

                    setIsConnected(true);
                    setAddress(addr);
                    const bal = await getSTXBalance(addr);
                    if (bal) setBalance(bal);
                    console.log(`Successfully connected: ${addr} with balance ${bal} STX`);
                } else {
                    console.error('No valid address found after connection');
                    alert(`No ${isMainnet ? 'mainnet' : 'testnet'} address found. Please ensure your wallet is set to the correct network.`);
                }
            } else {
                console.warn('No addresses returned from wallet');
            }
        } catch (err) {
            console.error('Failed to connect wallet:', err);
            // Provide more helpful error message
            if (err instanceof Error) {
                if (err.message.includes('User rejected')) {
                    console.log('User cancelled connection');
                } else {
                    alert(`Failed to connect: ${err.message}`);
                }
            }
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
            console.log('Wallet disconnected');
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
