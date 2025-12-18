// Token Launchpad API client
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================
// Token Types
// ============================================

export interface Token {
    id: string;
    contract_address: string;
    name: string;
    symbol: string;
    creator: string;
    image_uri?: string;
    description?: string;
    tokens_sold: number;
    stx_reserve: number;
    current_price: number;
    market_cap: number;
    is_graduated: boolean;
    graduated_at?: string;
    alex_pool_address?: string;
    created_at: string;
    updated_at: string;
}

export interface Trade {
    id: string;
    token_id: string;
    tx_id: string;
    trader: string;
    trade_type: 'buy' | 'sell';
    stx_amount: number;
    token_amount: number;
    price_at_trade: number;
    platform_fee: number;
    creator_fee: number;
    block_height?: number;
    timestamp?: string;
    created_at: string;
}

export interface Activity {
    id: string;
    event_type: 'token_created' | 'buy' | 'sell' | 'graduated';
    tx_id?: string;
    address?: string;
    token_id?: string;
    details?: Record<string, unknown>;
    created_at: string;
}

export interface LeaderboardEntry {
    id: string;
    address: string;
    total_trades: number;
    total_volume_stx: number;
    total_profit_stx: number;
    tokens_created: number;
    updated_at: string;
}

// ============================================
// Bonding Curve Calculations (client-side)
// ============================================

const INITIAL_PRICE = 0.01; // 0.01 STX
const SLOPE = 0.000001; // Price increment per token sold
const GRADUATION_THRESHOLD = 69000; // ~69,000 STX market cap

export function calculatePrice(tokensSold: number): number {
    return INITIAL_PRICE + (tokensSold * SLOPE);
}

export function calculateBuyAmount(stxAmount: number, tokensSold: number): number {
    const currentPrice = calculatePrice(tokensSold);
    return stxAmount / currentPrice;
}

export function calculateSellReturn(tokenAmount: number, tokensSold: number): number {
    const currentPrice = calculatePrice(tokensSold);
    return tokenAmount * currentPrice * 0.98; // 2% fee
}

export function getProgressToGraduation(marketCap: number): number {
    return Math.min((marketCap / GRADUATION_THRESHOLD) * 100, 100);
}

export function generateBondingCurveData(tokensSold: number, points: number = 50): { sold: number; price: number }[] {
    const data = [];
    const maxTokens = Math.max(tokensSold * 1.5, 1000000);
    const step = maxTokens / points;
    
    for (let i = 0; i <= points; i++) {
        const sold = i * step;
        data.push({
            sold: sold,
            price: calculatePrice(sold)
        });
    }
    return data;
}

// ============================================
// API Functions
// ============================================

// Health check
export async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/api/health`);
        return await response.json();
    } catch (error) {
        console.error('Health check failed:', error);
        return null;
    }
}

// Get all tokens
export async function getTokens(options?: { 
    orderBy?: string; 
    order?: 'asc' | 'desc'; 
    graduated?: boolean 
}): Promise<Token[]> {
    try {
        const params = new URLSearchParams();
        if (options?.orderBy) params.set('orderBy', options.orderBy);
        if (options?.order) params.set('order', options.order);
        if (options?.graduated !== undefined) params.set('graduated', String(options.graduated));
        
        const response = await fetch(`${API_URL}/api/tokens?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch tokens');
        return await response.json();
    } catch (error) {
        console.error('Error fetching tokens:', error);
        return [];
    }
}

// Get trending tokens
export async function getTrendingTokens(limit: number = 10): Promise<Token[]> {
    try {
        const response = await fetch(`${API_URL}/api/tokens/trending?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch trending tokens');
        return await response.json();
    } catch (error) {
        console.error('Error fetching trending tokens:', error);
        return [];
    }
}

// Get single token
export async function getToken(identifier: string): Promise<Token | null> {
    try {
        const response = await fetch(`${API_URL}/api/tokens/${identifier}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch token');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching token:', error);
        return null;
    }
}

// Get token trades
export async function getTokenTrades(tokenId: string, limit: number = 50): Promise<Trade[]> {
    try {
        const response = await fetch(`${API_URL}/api/tokens/${tokenId}/trades?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch trades');
        return await response.json();
    } catch (error) {
        console.error('Error fetching trades:', error);
        return [];
    }
}

// Get activity feed
export async function getActivity(limit: number = 50, type?: string): Promise<Activity[]> {
    try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (type) params.set('type', type);
        
        const response = await fetch(`${API_URL}/api/activity?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch activity');
        return await response.json();
    } catch (error) {
        console.error('Error fetching activity:', error);
        return [];
    }
}

// Get leaderboard
export async function getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
        const response = await fetch(`${API_URL}/api/leaderboard?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        return await response.json();
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

// ============================================
// Legacy exports for compatibility
// ============================================

export interface Launch {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    price_stx: number;
    max_supply: number;
    minted_count: number;
    status: 'upcoming' | 'live' | 'sold_out' | 'ended';
    contract_address?: string;
    contract_name?: string;
    start_date?: string;
    end_date?: string;
    created_at: string;
}

export async function getLaunches(): Promise<Launch[]> {
    return [];
}

export async function getLaunch(id: string): Promise<Launch | null> {
    return null;
}

export async function getStatus() {
    return checkHealth();
}
