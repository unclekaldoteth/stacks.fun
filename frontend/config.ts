// Stacks Connect and Network Configuration

// Get your WalletConnect project ID from https://cloud.walletconnect.com
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Network: 'mainnet' or 'testnet'
export const NETWORK = (process.env.NEXT_PUBLIC_STACKS_NETWORK || 'mainnet') as 'mainnet' | 'testnet';

// Contract deployer address
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER || 'SP1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX32N685T';

// App details
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'StacksPad';
export const APP_ICON = typeof window !== 'undefined'
    ? `${window.location.origin}${process.env.NEXT_PUBLIC_APP_ICON || '/favicon.ico'}`
    : '/favicon.ico';

// Hiro API Key
export const HIRO_API_KEY = process.env.NEXT_PUBLIC_HIRO_API_KEY || '';

// Backend API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
