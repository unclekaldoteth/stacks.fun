// Hiro Platform API Client
// Documentation: https://docs.hiro.so/

const HIRO_API_BASE = 'https://api.hiro.so';
const HIRO_API_KEY = process.env.NEXT_PUBLIC_HIRO_API_KEY;

interface NFTMetadata {
    token_uri: string;
    metadata?: {
        name?: string;
        description?: string;
        image?: string;
        attributes?: Array<{ trait_type: string; value: string }>;
    };
}

interface AccountNFT {
    asset_identifier: string;
    value: {
        hex: string;
        repr: string;
    };
}

interface Transaction {
    tx_id: string;
    tx_status: string;
    tx_type: string;
    sender_address: string;
    block_height: number;
    block_time: number;
}

// Headers for Hiro API requests
function getHeaders() {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (HIRO_API_KEY) {
        headers['x-api-key'] = HIRO_API_KEY;
    }

    return headers;
}

// Get account balance
export async function getAccountBalance(address: string) {
    try {
        const response = await fetch(
            `${HIRO_API_BASE}/extended/v1/address/${address}/balances`,
            { headers: getHeaders() }
        );

        if (!response.ok) throw new Error('Failed to fetch balance');
        return await response.json();
    } catch (error) {
        console.error('Error fetching balance:', error);
        return null;
    }
}

// Get STX balance specifically
export async function getSTXBalance(address: string): Promise<string | null> {
    try {
        const balance = await getAccountBalance(address);
        if (balance?.stx?.balance) {
            // Convert from micro-STX to STX
            return (parseInt(balance.stx.balance) / 1_000_000).toFixed(2);
        }
        return '0';
    } catch (error) {
        console.error('Error fetching STX balance:', error);
        return null;
    }
}

// Get NFTs owned by an address
export async function getAccountNFTs(address: string): Promise<AccountNFT[] | null> {
    try {
        const response = await fetch(
            `${HIRO_API_BASE}/extended/v1/tokens/nft/holdings?principal=${address}&limit=50`,
            { headers: getHeaders() }
        );

        if (!response.ok) throw new Error('Failed to fetch NFTs');
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        return null;
    }
}

// Get NFT metadata
export async function getNFTMetadata(
    contractAddress: string,
    contractName: string,
    tokenId: number
): Promise<NFTMetadata | null> {
    try {
        const response = await fetch(
            `${HIRO_API_BASE}/extended/v1/tokens/nft/metadata/${contractAddress}.${contractName}/${tokenId}`,
            { headers: getHeaders() }
        );

        if (!response.ok) throw new Error('Failed to fetch NFT metadata');
        return await response.json();
    } catch (error) {
        console.error('Error fetching NFT metadata:', error);
        return null;
    }
}

// Get contract events
export async function getContractEvents(
    contractAddress: string,
    contractName: string,
    limit: number = 20
) {
    try {
        const response = await fetch(
            `${HIRO_API_BASE}/extended/v1/contract/${contractAddress}.${contractName}/events?limit=${limit}`,
            { headers: getHeaders() }
        );

        if (!response.ok) throw new Error('Failed to fetch contract events');
        return await response.json();
    } catch (error) {
        console.error('Error fetching contract events:', error);
        return null;
    }
}

// Get transaction details
export async function getTransaction(txId: string): Promise<Transaction | null> {
    try {
        const response = await fetch(
            `${HIRO_API_BASE}/extended/v1/tx/${txId}`,
            { headers: getHeaders() }
        );

        if (!response.ok) throw new Error('Failed to fetch transaction');
        return await response.json();
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return null;
    }
}

// Get transaction status (simplified)
export async function getTransactionStatus(txId: string): Promise<string | null> {
    try {
        const tx = await getTransaction(txId);
        return tx?.tx_status || null;
    } catch (error) {
        console.error('Error fetching tx status:', error);
        return null;
    }
}

// Get recent transactions for an address
export async function getAddressTransactions(
    address: string,
    limit: number = 20
): Promise<Transaction[] | null> {
    try {
        const response = await fetch(
            `${HIRO_API_BASE}/extended/v1/address/${address}/transactions?limit=${limit}`,
            { headers: getHeaders() }
        );

        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return null;
    }
}

// Get contract info
export async function getContractInfo(contractAddress: string, contractName: string) {
    try {
        const response = await fetch(
            `${HIRO_API_BASE}/extended/v1/contract/${contractAddress}.${contractName}`,
            { headers: getHeaders() }
        );

        if (!response.ok) throw new Error('Failed to fetch contract info');
        return await response.json();
    } catch (error) {
        console.error('Error fetching contract info:', error);
        return null;
    }
}

// Get current block height
export async function getCurrentBlockHeight(): Promise<number | null> {
    try {
        const response = await fetch(
            `${HIRO_API_BASE}/extended/v1/block`,
            { headers: getHeaders() }
        );

        if (!response.ok) throw new Error('Failed to fetch block info');
        const data = await response.json();
        return data.results?.[0]?.height || null;
    } catch (error) {
        console.error('Error fetching block height:', error);
        return null;
    }
}
