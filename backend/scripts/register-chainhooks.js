#!/usr/bin/env node
/**
 * Chainhook Registration Script
 * 
 * This script registers chainhooks with the Hiro Platform API.
 * 
 * Prerequisites:
 * 1. Set your Hiro API Key in HIRO_API_KEY environment variable
 * 2. Set WEBHOOK_URL to your backend's public URL
 * 3. Set CHAINHOOK_SECRET to secure your webhook
 * 
 * Usage:
 *   node scripts/register-chainhooks.js --network testnet
 *   node scripts/register-chainhooks.js --network mainnet
 */

const fetch = require('node-fetch');
require('dotenv').config();

const HIRO_API_BASE = 'https://api.hiro.so';

// Configuration
const TESTNET_DEPLOYER = 'ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM';
const MAINNET_DEPLOYER = process.env.MAINNET_DEPLOYER || 'SP_YOUR_MAINNET_ADDRESS';

// Parse command line args
const args = process.argv.slice(2);
const networkIndex = args.indexOf('--network');
const network = networkIndex !== -1 ? args[networkIndex + 1] : 'testnet';

// Get configuration from environment
const HIRO_API_KEY = process.env.HIRO_API_KEY;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3001';
const CHAINHOOK_SECRET = process.env.CHAINHOOK_SECRET || '';

if (!HIRO_API_KEY) {
    console.error('❌ Error: HIRO_API_KEY environment variable is required');
    console.log('   Get your API key from: https://platform.hiro.so/');
    process.exit(1);
}

const deployerAddress = network === 'mainnet' ? MAINNET_DEPLOYER : TESTNET_DEPLOYER;

// Define chainhook predicates
const chainhooks = [
    {
        name: 'stacks-fun-token-created',
        description: 'Triggered when a new token is registered on Stacks.fun launchpad',
        network: network,
        predicate: {
            scope: 'contract_call',
            contract_identifier: `${deployerAddress}.launchpad-factory`,
            method: 'register-token'
        }
    },
    {
        name: 'stacks-fun-token-buy',
        description: 'Triggered when tokens are purchased on the bonding curve',
        network: network,
        predicate: {
            scope: 'contract_call',
            contract_identifier: `${deployerAddress}.bonding-curve`,
            method: 'buy'
        }
    },
    {
        name: 'stacks-fun-token-sell',
        description: 'Triggered when tokens are sold on the bonding curve',
        network: network,
        predicate: {
            scope: 'contract_call',
            contract_identifier: `${deployerAddress}.bonding-curve`,
            method: 'sell'
        }
    },
    {
        name: 'stacks-fun-graduation',
        description: 'Triggered when a token graduates to ALEX DEX',
        network: network,
        predicate: {
            scope: 'contract_call',
            contract_identifier: `${deployerAddress}.alex-graduation`,
            method: 'graduate-token'
        }
    }
];

async function registerChainhook(hook) {
    const payload = {
        name: hook.name,
        version: 1,
        chain: 'stacks',
        networks: {
            [hook.network]: {
                if_this: hook.predicate,
                then_that: {
                    http_post: {
                        url: `${WEBHOOK_URL}/api/chainhook`,
                        authorization_header: CHAINHOOK_SECRET ? `Bearer ${CHAINHOOK_SECRET}` : ''
                    }
                }
            }
        }
    };

    try {
        const response = await fetch(`${HIRO_API_BASE}/chainhook/v1/chainhooks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': HIRO_API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error(`❌ Failed to register ${hook.name}: ${error}`);
            return false;
        }

        const result = await response.json();
        console.log(`✅ Registered: ${hook.name} (ID: ${result.uuid || 'N/A'})`);
        return true;
    } catch (error) {
        console.error(`❌ Error registering ${hook.name}:`, error.message);
        return false;
    }
}

async function listChainhooks() {
    try {
        const response = await fetch(`${HIRO_API_BASE}/chainhook/v1/chainhooks`, {
            headers: {
                'x-api-key': HIRO_API_KEY
            }
        });

        if (!response.ok) {
            console.error('Failed to list chainhooks');
            return [];
        }

        const data = await response.json();
        return data.chainhooks || [];
    } catch (error) {
        console.error('Error listing chainhooks:', error.message);
        return [];
    }
}

async function main() {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║         Stacks.fun Chainhook Registration Script          ║
╠═══════════════════════════════════════════════════════════╣
║  Network:     ${network.padEnd(43)}║
║  Deployer:    ${deployerAddress.substring(0, 40)}...║
║  Webhook URL: ${WEBHOOK_URL.substring(0, 40).padEnd(43)}║
╚═══════════════════════════════════════════════════════════╝
    `);

    // Check existing chainhooks
    console.log('📋 Checking existing chainhooks...\n');
    const existing = await listChainhooks();

    if (existing.length > 0) {
        console.log(`   Found ${existing.length} existing chainhook(s):`);
        existing.forEach(ch => {
            console.log(`   - ${ch.uuid}: ${ch.enabled ? '✅' : '⏸️ '} ${ch.name || 'Unnamed'}`);
        });
        console.log('');
    }

    // Register chainhooks
    console.log('🔗 Registering chainhooks...\n');

    let successCount = 0;
    for (const hook of chainhooks) {
        const success = await registerChainhook(hook);
        if (success) successCount++;
    }

    console.log(`\n✨ Registration complete: ${successCount}/${chainhooks.length} successful`);

    if (successCount === chainhooks.length) {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    Next Steps                             ║
╠═══════════════════════════════════════════════════════════╣
║  1. Ensure your backend is running and accessible at:     ║
║     ${WEBHOOK_URL.padEnd(52)}║
║                                                           ║
║  2. Chainhooks will now send events to:                   ║
║     POST ${WEBHOOK_URL}/api/chainhook                     ║
║                                                           ║
║  3. Monitor your backend logs for incoming events         ║
╚═══════════════════════════════════════════════════════════╝
        `);
    }
}

main().catch(console.error);
