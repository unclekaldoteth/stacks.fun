'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
    formatAddress,
    isMainnet,
    detectWalletType,
    isWalletAvailable,
    getStacksConnect,
    getAppDetails,
    getWalletConnectProjectId,
    type WalletType
} from '@/lib/stacks';
import { getSTXBalance } from '@/lib/hiro';

interface UserData {
    profile?: {
        stxAddress?: {
            mainnet?: string;
            testnet?: string;
        };
    };
}

interface WalletContextType {
    // State
    isConnected: boolean;
    isConnecting: boolean;
    userData: UserData | null;
    address: string | null;
    balance: string | null;
    walletType: WalletType;
    isWalletInstalled: boolean;

    // Network info
    isMainnet: boolean;

    // Actions
    connect: () => void;
    disconnect: () => void;
    refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Store for user session (loaded dynamically)
let userSessionInstance: any = null;

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [walletType, setWalletType] = useState<WalletType>('unknown');
    const [isWalletInstalled, setIsWalletInstalled] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Initialize and check existing session
    useEffect(() => {
        setMounted(true);
        setIsWalletInstalled(isWalletAvailable());

        // Dynamically load and check session
        const initSession = async () => {
            try {
                const stacksConnect = await getStacksConnect();
                if (!stacksConnect) return;

                const { AppConfig, UserSession } = stacksConnect;
                const appConfig = new AppConfig(['store_write', 'publish_data']);
                userSessionInstance = new UserSession({ appConfig });

                if (userSessionInstance.isUserSignedIn()) {
                    const data = userSessionInstance.loadUserData();
                    const addr = isMainnet
                        ? data.profile?.stxAddress?.mainnet
                        : data.profile?.stxAddress?.testnet;

                    setUserData(data);
                    setAddress(addr || null);
                    setIsConnected(true);
                    setWalletType(detectWalletType());

                    // Fetch balance
                    if (addr) {
                        const bal = await getSTXBalance(addr);
                        if (bal) setBalance(bal);
                    }
                }
            } catch (error) {
                console.error('Error initializing wallet session:', error);
            }
        };

        initSession();
    }, []);

    // Refresh balance
    const refreshBalance = useCallback(async () => {
        if (address) {
            const bal = await getSTXBalance(address);
            if (bal) setBalance(bal);
        }
    }, [address]);

    // Connect wallet using @stacks/connect v8 connect() method
    const connectWallet = useCallback(async () => {
        setIsConnecting(true);

        try {
            const stacksConnect = await getStacksConnect();
            if (!stacksConnect) {
                console.error('Could not load Stacks Connect');
                setIsConnecting(false);
                return;
            }

            // In @stacks/connect v8, use 'connect' for wallet connection
            // 'authenticate' is deprecated - 'connect' properly supports walletConnectProjectId
            const { connect: stacksConnectFn } = stacksConnect;

            // Get WalletConnect project ID for mobile wallet support
            const walletConnectId = getWalletConnectProjectId();

            // Build connection options
            const connectOptions: Record<string, unknown> = {
                appDetails: getAppDetails(),
            };

            // Add WalletConnect project ID if configured
            if (walletConnectId) {
                connectOptions.walletConnectProjectId = walletConnectId;
                console.log('WalletConnect enabled with project ID');
            }

            // Use connect() which shows the wallet selection modal with WalletConnect option
            const response = await stacksConnectFn(connectOptions);

            if (response && response.addresses) {
                // v8 returns addresses directly from connect()
                const stxAddress = response.addresses.find(
                    (addr: { symbol?: string }) => addr.symbol === 'STX'
                );

                if (stxAddress) {
                    const addr = stxAddress.address;
                    setAddress(addr);
                    setIsConnected(true);
                    setWalletType(detectWalletType());

                    // Store in userData for compatibility
                    setUserData({
                        profile: {
                            stxAddress: {
                                [isMainnet ? 'mainnet' : 'testnet']: addr,
                            },
                        },
                    });

                    // Fetch balance after connect
                    if (addr) {
                        const bal = await getSTXBalance(addr);
                        if (bal) setBalance(bal);
                    }
                }
            }

            setIsConnecting(false);
        } catch (error) {
            console.error('Error connecting wallet:', error);
            setIsConnecting(false);
        }
    }, []);

    // Disconnect wallet
    const disconnect = useCallback(() => {
        if (userSessionInstance) {
            userSessionInstance.signUserOut('/');
        }
        setUserData(null);
        setAddress(null);
        setBalance(null);
        setIsConnected(false);
        setWalletType('unknown');
    }, []);

    // Don't render until mounted (prevents SSR issues)
    if (!mounted) {
        return <>{children}</>;
    }

    const value: WalletContextType = {
        isConnected,
        isConnecting,
        userData,
        address,
        balance,
        walletType,
        isWalletInstalled,
        isMainnet,
        connect: connectWallet,
        disconnect,
        refreshBalance,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

// Hook to use wallet context
export function useWallet(): WalletContextType {
    const context = useContext(WalletContext);
    // Return default values during SSR or when used outside provider
    if (context === undefined) {
        return {
            isConnected: false,
            isConnecting: false,
            userData: null,
            address: null,
            balance: null,
            walletType: 'unknown',
            isWalletInstalled: false,
            isMainnet,
            connect: () => { },
            disconnect: () => { },
            refreshBalance: async () => { },
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

// Export formatAddress for use in components
export { formatAddress };
