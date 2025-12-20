require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001;

// Debug: Log environment variables (without exposing secrets)
console.log('🔍 Environment check:');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set');
console.log('   STACKS_NETWORK:', process.env.STACKS_NETWORK || 'not set');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://')) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
} else {
    console.warn('⚠️  Supabase credentials not found, using in-memory storage');
    console.warn('   URL valid:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'empty');
}

// In-memory fallback storage
let inMemoryState = {
    tokens: [],
    trades: [],
    activity: []
};

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        // Allow localhost, Vercel, and Railway domains
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://stacksfun.vercel.app',
            'https://stacksfun-production.up.railway.app',
            process.env.FRONTEND_URL
        ].filter(Boolean);

        if (allowedOrigins.includes(origin) || origin.includes('vercel.app') || origin.includes('railway.app')) {
            return callback(null, true);
        }
        return callback(null, true); // Allow all for now
    },
    credentials: true
}));
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// API Routes - Tokens
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        supabase: supabase ? 'connected' : 'not configured',
        network: process.env.STACKS_NETWORK || 'mainnet',
        timestamp: new Date().toISOString()
    });
});

// Get all tokens
app.get('/api/tokens', async (req, res) => {
    try {
        const { orderBy = 'created_at', order = 'desc', graduated } = req.query;

        if (supabase) {
            let query = supabase.from('tokens').select('*');

            if (graduated !== undefined) {
                query = query.eq('is_graduated', graduated === 'true');
            }

            const { data, error } = await query.order(orderBy, { ascending: order === 'asc' });
            if (error) {
                console.error('Supabase error fetching tokens:', error);
                throw error;
            }
            res.json(data || []);
        } else {
            res.json(inMemoryState.tokens);
        }
    } catch (error) {
        console.error('Error fetching tokens:', error);
        res.status(500).json({ error: 'Failed to fetch tokens', details: error.message });
    }
});

// Seed sample tokens (development only)
app.post('/api/seed', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Seeding disabled in production' });
    }

    const sampleTokens = [
        {
            contract_address: 'SP1234567890.sample-token-1',
            name: 'BitcoinDog',
            symbol: 'BDOG',
            creator: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9',
            image_uri: 'https://via.placeholder.com/100/f7931a/ffffff?text=BDOG',
            description: 'The first dog memecoin on Stacks. Much wow, very Bitcoin.',
            tokens_sold: 500000,
            stx_reserve: 15000,
            current_price: 0.03,
            market_cap: 15000,
            is_graduated: false
        },
        {
            contract_address: 'SP1234567890.sample-token-2',
            name: 'StacksFrog',
            symbol: 'SFROG',
            creator: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
            image_uri: 'https://via.placeholder.com/100/22c55e/ffffff?text=FROG',
            description: 'Ribbit your way to the moon. The ultimate frog memecoin.',
            tokens_sold: 1200000,
            stx_reserve: 45000,
            current_price: 0.0375,
            market_cap: 45000,
            is_graduated: false
        },
        {
            contract_address: 'SP1234567890.sample-token-3',
            name: 'StacksCat',
            symbol: 'SCAT',
            creator: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
            image_uri: 'https://via.placeholder.com/100/a855f7/ffffff?text=SCAT',
            description: 'Meow to the moon. A cat that climbs the bonding curve.',
            tokens_sold: 2500000,
            stx_reserve: 68000,
            current_price: 0.0272,
            market_cap: 68000,
            is_graduated: true,
            graduated_at: new Date().toISOString()
        }
    ];

    const sampleActivity = [
        { event_type: 'token_created', tx_id: '0xabc123', address: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9' },
        { event_type: 'buy', tx_id: '0xdef456', address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE' },
        { event_type: 'buy', tx_id: '0xghi789', address: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR' },
        { event_type: 'sell', tx_id: '0xjkl012', address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE' },
        { event_type: 'graduated', tx_id: '0xmno345', address: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR' }
    ];

    try {
        if (supabase) {
            // Insert tokens
            const { error: tokenError } = await supabase.from('tokens').upsert(sampleTokens, { onConflict: 'symbol' });
            if (tokenError) {
                console.error('Error seeding tokens:', tokenError);
                return res.status(500).json({ error: 'Failed to seed tokens', details: tokenError.message });
            }

            // Insert activity
            const { error: activityError } = await supabase.from('activity').insert(sampleActivity);
            if (activityError) {
                console.error('Error seeding activity:', activityError);
            }

            res.json({ success: true, message: 'Seeded 3 tokens and 5 activity records' });
        } else {
            inMemoryState.tokens = sampleTokens;
            inMemoryState.activity = sampleActivity;
            res.json({ success: true, message: 'Seeded in-memory storage' });
        }
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: 'Failed to seed data', details: error.message });
    }
});

// Sync function to fetch tokens from blockchain
async function syncTokensFromBlockchain() {
    try {
        const DEPLOYER = process.env.CONTRACT_DEPLOYER || 'ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM';
        const NETWORK = process.env.STACKS_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
        const API_BASE = NETWORK === 'mainnet'
            ? 'https://api.hiro.so'
            : 'https://api.testnet.hiro.so';

        // Fetch recent transactions for the launchpad-factory contract
        const txUrl = `${API_BASE}/extended/v1/address/${DEPLOYER}.launchpad-factory/transactions?limit=50`;
        const txResponse = await fetch(txUrl);
        const txData = await txResponse.json();

        console.log(`🔍 Found ${txData.results?.length || 0} transactions from ${DEPLOYER}.launchpad-factory`);

        let syncedCount = 0;
        let processedCount = 0;

        for (const tx of txData.results || []) {
            if (tx.tx_status !== 'success') continue;
            if (tx.tx_type !== 'contract_call') continue;
            if (tx.contract_call?.function_name !== 'register-token') continue;

            processedCount++;

            const args = tx.contract_call.function_args || [];
            const name = args.find(a => a.name === 'name')?.repr?.replace(/"/g, '') || 'Unknown';
            const symbol = args.find(a => a.name === 'symbol')?.repr?.replace(/"/g, '') || 'UNK';
            const bondingCurve = args.find(a => a.name === 'bonding-curve')?.repr?.replace(/'/g, '') || '';
            const description = args.find(a => a.name === 'description')?.repr?.replace(/\(some u"|"\)/g, '') || '';

            // Use tx_id as unique contract address since all tokens share the same bonding curve
            const tokenData = {
                contract_address: tx.tx_id,  // tx_id is unique per token creation
                name: name,
                symbol: symbol,
                creator: tx.sender_address,
                image_uri: null,
                description: description,
                tokens_sold: 0,
                stx_reserve: 0,
                current_price: 0.01,
                market_cap: 0,
                is_graduated: false,
                created_at: tx.burn_block_time_iso
            };

            if (supabase) {
                // First check if token already exists
                console.log(`🔍 Checking if ${symbol} exists...`);
                const { data: existing, error: checkError } = await supabase
                    .from('tokens')
                    .select('id, symbol')
                    .eq('symbol', symbol)
                    .maybeSingle();

                console.log(`   Result for ${symbol}: existing=${JSON.stringify(existing)}, error=${checkError?.message || 'none'}`);

                if (checkError) {
                    console.error(`Error checking ${symbol}:`, checkError.message);
                    continue;
                }

                if (!existing) {
                    // Insert new token
                    console.log(`   Inserting new token: ${symbol}`);
                    const { error } = await supabase
                        .from('tokens')
                        .insert(tokenData);

                    if (error) {
                        console.error(`Failed to insert ${symbol}:`, error.message);
                    } else {
                        syncedCount++;
                        console.log(`✅ Synced new token: ${symbol}`);
                    }
                } else {
                    console.log(`⏭️ Token ${symbol} already exists`);
                }
            }
        }

        console.log(`📊 Sync complete: ${processedCount} register-token txs processed, ${syncedCount} new tokens added`);

        return { success: true, syncedCount, processedCount, network: NETWORK };
    } catch (error) {
        console.error('Sync error:', error);
        return { success: false, error: error.message };
    }
}

// Start automatic sync every 30 seconds
const SYNC_INTERVAL = 30 * 1000; // 30 seconds
setInterval(async () => {
    const result = await syncTokensFromBlockchain();
    if (result.syncedCount > 0) {
        console.log(`🔄 Auto-sync: ${result.syncedCount} new tokens`);
    }
}, SYNC_INTERVAL);

// Initial sync on startup (after 5 seconds)
setTimeout(async () => {
    console.log('🔄 Running initial token sync...');
    const result = await syncTokensFromBlockchain();
    console.log(`✅ Initial sync complete: ${result.syncedCount} tokens`);
}, 5000);

// Manual sync endpoint
app.post('/api/sync', async (req, res) => {
    console.log('🔄 Manual sync triggered...');
    const result = await syncTokensFromBlockchain();

    if (result.success) {
        res.json({
            success: true,
            message: `Synced ${result.syncedCount} tokens from blockchain`,
            processedCount: result.processedCount,
            syncedCount: result.syncedCount,
            network: result.network
        });
    } else {
        res.status(500).json({ error: 'Failed to sync', details: result.error });
    }
});


// Get trending tokens (highest market cap)
app.get('/api/tokens/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        if (supabase) {
            const { data, error } = await supabase
                .from('tokens')
                .select('*')
                .eq('is_graduated', false)
                .order('market_cap', { ascending: false })
                .limit(limit);

            if (error) throw error;
            res.json(data || []);
        } else {
            res.json(inMemoryState.tokens.slice(0, limit));
        }
    } catch (error) {
        console.error('Error fetching trending tokens:', error);
        res.status(500).json({ error: 'Failed to fetch trending tokens' });
    }
});

// Get single token by symbol or id
app.get('/api/tokens/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;

        if (supabase) {
            // Try to find by symbol first, then by ID
            let query = supabase.from('tokens').select('*');

            if (identifier.length <= 10) {
                query = query.eq('symbol', identifier.toUpperCase());
            } else {
                query = query.eq('id', identifier);
            }

            const { data, error } = await query.single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return res.status(404).json({ error: 'Token not found' });
                }
                throw error;
            }
            res.json(data);
        } else {
            const token = inMemoryState.tokens.find(
                t => t.symbol === identifier.toUpperCase() || t.id === identifier
            );
            if (!token) {
                return res.status(404).json({ error: 'Token not found' });
            }
            res.json(token);
        }
    } catch (error) {
        console.error('Error fetching token:', error);
        res.status(500).json({ error: 'Failed to fetch token' });
    }
});

// ============================================
// API Routes - Trades
// ============================================

// Get trades for a token
app.get('/api/tokens/:id/trades', async (req, res) => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        if (supabase) {
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .eq('token_id', id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            res.json(data || []);
        } else {
            const trades = inMemoryState.trades.filter(t => t.token_id === id).slice(0, limit);
            res.json(trades);
        }
    } catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json({ error: 'Failed to fetch trades' });
    }
});

// Get activity feed
app.get('/api/activity', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const eventType = req.query.type;

        if (supabase) {
            let query = supabase.from('activity').select('*');

            if (eventType) {
                query = query.eq('event_type', eventType);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            res.json(data || []);
        } else {
            res.json(inMemoryState.activity.slice(0, limit));
        }
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;

        if (supabase) {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('total_volume_stx', { ascending: false })
                .limit(limit);

            if (error) throw error;
            res.json(data || []);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// ============================================
// Chainhook Webhook Handler
// ============================================

app.post('/api/chainhook', async (req, res) => {
    console.log('📩 Received Chainhook event');

    // Verify webhook secret if configured
    const webhookSecret = process.env.CHAINHOOK_SECRET;
    if (webhookSecret) {
        const providedSecret = req.headers['x-chainhook-secret'];
        if (providedSecret !== webhookSecret) {
            console.warn('⚠️  Invalid Chainhook secret');
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    try {
        const events = req.body;

        // Process Chainhook events
        if (events.apply) {
            for (const block of events.apply) {
                for (const tx of block.transactions) {
                    if (tx.status === 'success') {
                        await processTransaction(tx, block);
                    }
                }
            }
        }

        res.status(200).json({ status: 'processed' });
    } catch (error) {
        console.error('Error processing Chainhook event:', error);
        res.status(500).json({ error: 'Failed to process event' });
    }
});

// Process individual transaction from Chainhook
async function processTransaction(tx, block) {
    const txId = tx.transaction_identifier?.hash;
    const sender = tx.metadata?.sender;
    const contractCall = tx.metadata?.kind?.ContractCall;

    console.log(`🔄 Processing transaction: ${txId}`);

    if (!contractCall) return;

    const { contract_identifier, function_name } = contractCall;

    // Parse the print events to get actual data
    const printEvents = tx.metadata?.receipt?.events?.filter(e => e.type === 'SmartContractEvent') || [];

    // Handle different event types based on contract function
    switch (function_name) {
        case 'register-token':
            await handleTokenCreated(txId, sender, printEvents, block);
            break;
        case 'buy':
            await handleBuy(txId, sender, printEvents, block);
            break;
        case 'sell':
            await handleSell(txId, sender, printEvents, block);
            break;
        case 'graduate':
        case 'graduate-token':
            await handleGraduation(txId, sender, printEvents, block);
            break;
        default:
            console.log(`Unknown function: ${function_name}`);
    }
}

// Handle token creation event
async function handleTokenCreated(txId, sender, printEvents, block) {
    console.log('🪙 Token created event');

    // Extract data from print event
    const eventData = extractEventData(printEvents, 'token-created');
    if (!eventData) return;

    const tokenData = {
        contract_address: eventData.bonding_curve || '',
        name: eventData.name || '',
        symbol: eventData.symbol || '',
        creator: sender,
        tokens_sold: 0,
        stx_reserve: 0,
        current_price: 0.01,
        market_cap: 0,
        is_graduated: false
    };

    if (supabase) {
        const { error } = await supabase.from('tokens').insert(tokenData);
        if (error) console.error('Error storing token:', error);

        // Record activity
        await recordActivity('token_created', txId, sender, tokenData);
    } else {
        inMemoryState.tokens.push({ ...tokenData, id: txId });
    }
}

// Handle buy event
async function handleBuy(txId, sender, printEvents, block) {
    console.log('💰 Buy event');

    const eventData = extractEventData(printEvents, 'buy');
    if (!eventData) return;

    const tradeData = {
        tx_id: txId,
        trader: sender,
        trade_type: 'buy',
        stx_amount: eventData.stx_amount / 100000000 || 0,
        token_amount: eventData.tokens_received / 100000000 || 0,
        price_at_trade: 0.01, // Calculate from curve
        block_height: block.block_identifier?.index,
        timestamp: new Date().toISOString()
    };

    if (supabase) {
        // Find token by contract address
        const { data: token } = await supabase
            .from('tokens')
            .select('id')
            .eq('contract_address', eventData.token)
            .single();

        if (token) {
            tradeData.token_id = token.id;
            const { error } = await supabase.from('trades').insert(tradeData);
            if (error) console.error('Error storing trade:', error);

            await recordActivity('buy', txId, sender, { ...tradeData, token_id: token.id });
        }
    } else {
        inMemoryState.trades.push(tradeData);
    }
}

// Handle sell event
async function handleSell(txId, sender, printEvents, block) {
    console.log('💸 Sell event');

    const eventData = extractEventData(printEvents, 'sell');
    if (!eventData) return;

    const tradeData = {
        tx_id: txId,
        trader: sender,
        trade_type: 'sell',
        stx_amount: eventData.stx_received / 100000000 || 0,
        token_amount: eventData.tokens_sold / 100000000 || 0,
        price_at_trade: 0.01,
        block_height: block.block_identifier?.index,
        timestamp: new Date().toISOString()
    };

    if (supabase) {
        const { data: token } = await supabase
            .from('tokens')
            .select('id')
            .eq('contract_address', eventData.token)
            .single();

        if (token) {
            tradeData.token_id = token.id;
            const { error } = await supabase.from('trades').insert(tradeData);
            if (error) console.error('Error storing trade:', error);

            await recordActivity('sell', txId, sender, { ...tradeData, token_id: token.id });
        }
    } else {
        inMemoryState.trades.push(tradeData);
    }
}

// Handle graduation event
async function handleGraduation(txId, sender, printEvents, block) {
    console.log('🎓 Graduation event');

    const eventData = extractEventData(printEvents, 'token-graduated') ||
        extractEventData(printEvents, 'graduation-initiated');
    if (!eventData) return;

    if (supabase) {
        const { error } = await supabase
            .from('tokens')
            .update({
                is_graduated: true,
                graduated_at: new Date().toISOString()
            })
            .eq('contract_address', eventData.token);

        if (error) console.error('Error updating graduation:', error);

        await recordActivity('graduated', txId, sender, eventData);
    }
}

// Helper: Extract event data from print events
function extractEventData(printEvents, eventType) {
    for (const event of printEvents) {
        try {
            const data = event.data?.value || event.value;
            if (data && data.event === eventType) {
                return data;
            }
        } catch (e) {
            // Continue to next event
        }
    }
    return null;
}

// Helper: Record activity
async function recordActivity(eventType, txId, address, details) {
    if (!supabase) return;

    const { error } = await supabase.from('activity').insert({
        event_type: eventType,
        tx_id: txId,
        address: address,
        token_id: details.token_id || null,
        details: JSON.stringify(details)
    });

    if (error) console.error('Error recording activity:', error);
}

// ============================================
// Error handling
// ============================================

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// ============================================
// Start server
// ============================================

app.listen(port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Stacks Token Launchpad Backend                       ║
║   ──────────────────────────────────────────────────      ║
║   Server:    http://localhost:${port}                       ║
║   Network:   ${(process.env.STACKS_NETWORK || 'mainnet').padEnd(10)}                            ║
║   Supabase:  ${supabase ? 'Connected ✅' : 'Not configured ⚠️'}                       ║
║                                                           ║
║   Endpoints:                                              ║
║   - GET  /api/tokens          List all tokens             ║
║   - GET  /api/tokens/trending Trending tokens             ║
║   - GET  /api/tokens/:id      Token details               ║
║   - GET  /api/tokens/:id/trades Token trade history       ║
║   - GET  /api/activity        Activity feed               ║
║   - GET  /api/leaderboard     Top traders                 ║
║   - POST /api/chainhook       Chainhook webhook           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
