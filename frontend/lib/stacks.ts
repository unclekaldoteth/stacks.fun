// Stacks Connect and Network utilities
// These are re-exported to avoid SSR issues with dynamic imports

// Network configuration
const networkName = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'mainnet';
export const isMainnet = networkName === 'mainnet';

// App details for wallet connection
export const appName = process.env.NEXT_PUBLIC_APP_NAME || 'StacksPad';

export function getAppDetails() {
    return {
        name: appName,
        icon: typeof window !== 'undefined'
            ? window.location.origin + (process.env.NEXT_PUBLIC_APP_ICON || '/favicon.ico')
            : '/favicon.ico',
    };
}

// Format address for display (truncated)
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
    if (!address || address.length < startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

// Get explorer URL for transaction
export function getExplorerTxUrl(txId: string): string {
    const baseUrl = 'https://explorer.stacks.co/txid';
    const networkParam = isMainnet ? '' : '?chain=testnet';
    return `${baseUrl}/${txId}${networkParam}`;
}

// Get explorer URL for address
export function getExplorerAddressUrl(address: string): string {
    const baseUrl = 'https://explorer.stacks.co/address';
    const networkParam = isMainnet ? '' : '?chain=testnet';
    return `${baseUrl}/${address}${networkParam}`;
}

// Available wallet types
export type WalletType = 'leather' | 'xverse' | 'hiro' | 'unknown';

// Detect which wallet is being used (heuristic)
export function detectWalletType(): WalletType {
    if (typeof window === 'undefined') return 'unknown';

    // Check common wallet providers
    const provider = (window as any).StacksProvider;

    if (provider) {
        if (provider.isLeather) return 'leather';
        if (provider.isXverse) return 'xverse';
        if (provider.isHiro) return 'hiro';
    }

    return 'unknown';
}

// Check if any Stacks wallet is available
export function isWalletAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window as any).StacksProvider;
}

// Dynamically load @stacks/connect only on client
export async function getStacksConnect() {
    if (typeof window === 'undefined') return null;
    const module = await import('@stacks/connect');
    return module;
}

// Dynamically load @stacks/network only on client
export async function getStacksNetwork() {
    if (typeof window === 'undefined') return null;
    const module = await import('@stacks/network');
    return module;
}

// Get the network object
export async function getNetwork() {
    const networkModule = await getStacksNetwork();
    if (!networkModule) return null;
    return isMainnet ? networkModule.STACKS_MAINNET : networkModule.STACKS_TESTNET;
}
