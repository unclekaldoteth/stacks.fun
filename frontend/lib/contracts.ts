// Stacks Launchpad Contract Configuration
// Contract addresses and interaction functions

import { getStacksConnect, getStacksNetwork, isMainnet, getAppDetails } from './stacks';

// Contract deployer address
const DEPLOYER = process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER || 'ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM';

// Contract addresses
export const CONTRACTS = {
    bondingCurve: {
        address: DEPLOYER,
        name: 'bonding-curve',
    },
    launchpadFactory: {
        address: DEPLOYER,
        name: 'launchpad-factory',
    },
    launchpadToken: {
        address: DEPLOYER,
        name: 'launchpad-token',
    },
    alexGraduation: {
        address: DEPLOYER,
        name: 'alex-graduation',
    },
    sip010Trait: {
        address: DEPLOYER,
        name: 'sip-010-trait',
    },
} as const;

// Get full contract identifier (address.name)
export function getContractId(contract: keyof typeof CONTRACTS): string {
    const c = CONTRACTS[contract];
    return `${c.address}.${c.name}`;
}

// ============================================
// Contract Call Functions
// ============================================

interface ContractCallOptions {
    onFinish?: (data: { txId: string }) => void;
    onCancel?: () => void;
}

// Helper to dynamically import @stacks/transactions
async function getTransactionHelpers() {
    const module = await import('@stacks/transactions');
    return module;
}

// Buy tokens from bonding curve
export async function buyTokens(
    tokenContract: string,
    stxAmount: number,
    minTokens: number,
    options?: ContractCallOptions
): Promise<void> {
    const connect = await getStacksConnect();
    const network = await getStacksNetwork();
    const tx = await getTransactionHelpers();

    if (!connect || !network) {
        throw new Error('Stacks libraries not loaded');
    }

    const { openContractCall } = connect;
    const stxNetwork = isMainnet ? network.STACKS_MAINNET : network.STACKS_TESTNET;

    // Convert STX to micro-STX (1 STX = 1,000,000 micro-STX)
    const microStxAmount = Math.floor(stxAmount * 1_000_000);
    const minTokensScaled = Math.floor(minTokens * 100_000_000); // 8 decimals

    // Parse token contract into address and name
    const [tokenAddress, tokenName] = tokenContract.split('.');

    await openContractCall({
        network: stxNetwork,
        contractAddress: CONTRACTS.bondingCurve.address,
        contractName: CONTRACTS.bondingCurve.name,
        functionName: 'buy',
        functionArgs: [
            tx.contractPrincipalCV(tokenAddress, tokenName),
            tx.uintCV(microStxAmount),
            tx.uintCV(minTokensScaled),
        ],
        postConditionMode: tx.PostConditionMode.Allow,
        appDetails: getAppDetails(),
        onFinish: (data) => {
            console.log('Buy transaction submitted:', data.txId);
            options?.onFinish?.(data);
        },
        onCancel: () => {
            console.log('Buy transaction cancelled');
            options?.onCancel?.();
        },
    });
}

// Sell tokens to bonding curve
export async function sellTokens(
    tokenContract: string,
    tokenAmount: number,
    minStx: number,
    options?: ContractCallOptions
): Promise<void> {
    const connect = await getStacksConnect();
    const network = await getStacksNetwork();
    const tx = await getTransactionHelpers();

    if (!connect || !network) {
        throw new Error('Stacks libraries not loaded');
    }

    const { openContractCall } = connect;
    const stxNetwork = isMainnet ? network.STACKS_MAINNET : network.STACKS_TESTNET;

    // Convert to proper scales
    const tokenAmountScaled = Math.floor(tokenAmount * 100_000_000); // 8 decimals
    const minStxMicro = Math.floor(minStx * 1_000_000);

    // Parse token contract into address and name
    const [tokenAddress, tokenName] = tokenContract.split('.');

    await openContractCall({
        network: stxNetwork,
        contractAddress: CONTRACTS.bondingCurve.address,
        contractName: CONTRACTS.bondingCurve.name,
        functionName: 'sell',
        functionArgs: [
            tx.contractPrincipalCV(tokenAddress, tokenName),
            tx.uintCV(tokenAmountScaled),
            tx.uintCV(minStxMicro),
        ],
        postConditionMode: tx.PostConditionMode.Allow,
        appDetails: getAppDetails(),
        onFinish: (data) => {
            console.log('Sell transaction submitted:', data.txId);
            options?.onFinish?.(data);
        },
        onCancel: () => {
            console.log('Sell transaction cancelled');
            options?.onCancel?.();
        },
    });
}

// Register a new token in the launchpad factory
export async function registerToken(
    name: string,
    symbol: string,
    imageUri?: string,
    description?: string,
    options?: ContractCallOptions
): Promise<void> {
    const connect = await getStacksConnect();
    const network = await getStacksNetwork();
    const tx = await getTransactionHelpers();

    if (!connect || !network) {
        throw new Error('Stacks libraries not loaded');
    }

    const { openContractCall } = connect;
    const stxNetwork = isMainnet ? network.STACKS_MAINNET : network.STACKS_TESTNET;

    await openContractCall({
        network: stxNetwork,
        contractAddress: CONTRACTS.launchpadFactory.address,
        contractName: CONTRACTS.launchpadFactory.name,
        functionName: 'register-token',
        functionArgs: [
            tx.stringAsciiCV(name.slice(0, 32)),
            tx.stringAsciiCV(symbol.slice(0, 10)),
            tx.contractPrincipalCV(CONTRACTS.bondingCurve.address, CONTRACTS.bondingCurve.name),
            imageUri ? tx.someCV(tx.stringUtf8CV(imageUri.slice(0, 256))) : tx.noneCV(),
            description ? tx.someCV(tx.stringUtf8CV(description.slice(0, 500))) : tx.noneCV(),
        ],
        postConditionMode: tx.PostConditionMode.Allow,
        appDetails: getAppDetails(),
        onFinish: (data) => {
            console.log('Token registered:', data.txId);
            options?.onFinish?.(data);
        },
        onCancel: () => {
            console.log('Token registration cancelled');
            options?.onCancel?.();
        },
    });
}

// Create a bonding curve pool for a token
export async function createPool(
    tokenContract: string,
    creatorAddress: string,
    options?: ContractCallOptions
): Promise<void> {
    const connect = await getStacksConnect();
    const network = await getStacksNetwork();
    const tx = await getTransactionHelpers();

    if (!connect || !network) {
        throw new Error('Stacks libraries not loaded');
    }

    const { openContractCall } = connect;
    const stxNetwork = isMainnet ? network.STACKS_MAINNET : network.STACKS_TESTNET;

    // Parse token contract into address and name
    const [tokenAddress, tokenName] = tokenContract.split('.');

    await openContractCall({
        network: stxNetwork,
        contractAddress: CONTRACTS.bondingCurve.address,
        contractName: CONTRACTS.bondingCurve.name,
        functionName: 'create-pool',
        functionArgs: [
            tx.contractPrincipalCV(tokenAddress, tokenName),
            tx.standardPrincipalCV(creatorAddress),
        ],
        postConditionMode: tx.PostConditionMode.Allow,
        appDetails: getAppDetails(),
        onFinish: (data) => {
            console.log('Pool created:', data.txId);
            options?.onFinish?.(data);
        },
        onCancel: () => {
            console.log('Pool creation cancelled');
            options?.onCancel?.();
        },
    });
}

// ============================================
// Read-only Contract Queries
// ============================================

const HIRO_API = isMainnet
    ? 'https://api.hiro.so'
    : 'https://api.testnet.hiro.so';

export interface PoolInfo {
    creator: string;
    tokensSold: number;
    stxReserve: number;
    isGraduated: boolean;
    createdAt: number;
}

// Get pool info from bonding curve
export async function getPoolInfo(tokenContract: string): Promise<PoolInfo | null> {
    try {
        const contractId = getContractId('bondingCurve');
        const response = await fetch(
            `${HIRO_API}/v2/contracts/call-read/${contractId.replace('.', '/')}/get-pool-info`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: DEPLOYER,
                    arguments: [tokenContract],
                }),
            }
        );

        if (!response.ok) return null;
        const data = await response.json();

        // Parse Clarity response (simplified - actual parsing needed)
        console.log('Pool info response:', data);
        return null; // TODO: Parse clarity value
    } catch (error) {
        console.error('Error fetching pool info:', error);
        return null;
    }
}

// Get current token price
export async function getCurrentPrice(tokenContract: string): Promise<number | null> {
    try {
        const contractId = getContractId('bondingCurve');
        const response = await fetch(
            `${HIRO_API}/v2/contracts/call-read/${contractId.replace('.', '/')}/get-current-price`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: DEPLOYER,
                    arguments: [tokenContract],
                }),
            }
        );

        if (!response.ok) return null;
        const data = await response.json();
        console.log('Price response:', data);
        return null; // TODO: Parse clarity value
    } catch (error) {
        console.error('Error fetching current price:', error);
        return null;
    }
}

// Get token info from factory
export async function getTokenInfo(tokenId: number): Promise<unknown | null> {
    try {
        const contractId = getContractId('launchpadFactory');
        const response = await fetch(
            `${HIRO_API}/v2/contracts/call-read/${contractId.replace('.', '/')}/get-token-info`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: DEPLOYER,
                    arguments: [`u${tokenId}`],
                }),
            }
        );

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching token info:', error);
        return null;
    }
}
