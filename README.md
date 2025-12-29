# Stacks.fun Token Launchpad

A decentralized token launchpad built on Stacks with bonding curves, secured by Bitcoin. Launch tokens, trade on automated market makers, and graduate to ALEX DEX.

Stacks.fun enables anyone to create and trade tokens using automated bonding curve pricing. **Trading is powered by USDCx** (bridged USDC via Circle xReserve) with seamless wallet integration including WalletConnect for mobile wallets.

---

## Why Stacks.fun?

- Instant token creation without coding
- Guaranteed liquidity through bonding curves
- Fair launch mechanics with transparent pricing
- Bitcoin security via Stacks blockchain
- Automatic DEX graduation at market cap threshold

---

## Key Features

### For Token Creators
- No-code SIP-010 token deployment
- 1% creator fee on all trades
- Automatic liquidity graduation to ALEX DEX at $69K market cap

### For Traders
- Early access to new tokens
- Transparent bonding curve pricing
- No rug pulls - liquidity locked in contract

### For Developers
- Open source Clarity smart contracts
- REST API for token data
- Real-time chainhook event feeds

---

## Architecture Overview

### Smart Contracts (Clarity 4)

- **Launchpad Factory**
  Token registration and metadata management.

- **Bonding Curve USDCx** (Primary)
  USDCx stablecoin trading with Circle xReserve integration. Uses trait-based token passing for flexibility.

- **Bonding Curve V2**
  STX trading support (legacy).

- **ALEX Graduation**
  Automatic liquidity migration to ALEX DEX.

```
stacks.fun/
├── contracts/
│   ├── launchpad-factory.clar     # Token registry
│   ├── bonding-curve-v2.clar      # STX trading
│   ├── bonding-curve-usdcx.clar   # USDCx trading
│   ├── alex-graduation.clar       # DEX migration
│   ├── launchpad-token.clar       # SIP-010 template
│   └── mock-usdcx.clar            # Test token
├── frontend/                       # Next.js application
├── backend/                        # Node.js indexer + API
└── deployments/                    # Clarinet deployment plans
```

### Backend + Frontend
- REST API with real-time platform statistics
- Token and activity endpoints with mainnet filtering
- Real-time price feeds and bonding curve calculations
- User portfolio tracking
- Chainhook event indexing
- Production deployment on Railway (backend) and Vercel (frontend)

---

## Mainnet Deployment

### Smart Contracts Live on Stacks Mainnet

**Deployer Address:** `SP1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX32N685T`

### Deployed Contracts

| Contract Name | Description |
|--------------|-------------|
| **launchpad-factory** | Token registration and metadata |
| **bonding-curve** | Original STX bonding curve |
| **bonding-curve-v2** | Improved STX trading with fees |
| **bonding-curve-usdcx** | USDCx stablecoin trading |
| **alex-graduation** | ALEX DEX migration logic |
| **launchpad-token** | SIP-010 token template |

### Deployment Details

- **Network:** Stacks Mainnet
- **Deployment Date:** December 29, 2025
- **Clarity Version:** 4
- **Epoch:** 3.3
- **Status:** Confirmed on-chain

### Explorer Links

View contracts on Stacks Explorer:
https://explorer.hiro.so/address/SP1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX32N685T?chain=mainnet

### Contract Address for Integration

```clarity
;; Launchpad Factory
SP1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX32N685T.launchpad-factory

;; Bonding Curve V2 (STX)
SP1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX32N685T.bonding-curve-v2

;; Bonding Curve USDCx
SP1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX32N685T.bonding-curve-usdcx

;; USDCx Token (Circle xReserve)
SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx
```

---

## Smart Contract Functions

### launchpad-factory

| Function | Description |
|----------|-------------|
| `register-token` | Register new token with metadata |
| `get-token-info` | Get token details by ID |
| `set-graduated` | Mark token as graduated to DEX |

### bonding-curve-v2

| Function | Description |
|----------|-------------|
| `buy` | Purchase tokens with STX |
| `sell` | Sell tokens for STX |
| `get-current-price` | Get current token price |
| `get-buy-price` | Calculate cost to buy amount |
| `get-sell-price` | Calculate return for selling |
| `get-pool-info` | Get pool reserves and status |

### bonding-curve-usdcx

| Function | Description |
|----------|-------------|
| `buy` | Purchase tokens with USDCx (trait-based payment token) |
| `sell` | Sell tokens for USDCx (trait-based payment token) |
| `get-current-price` | Get current token price in USDCx |
| `get-buy-price` | Calculate cost to buy tokens |
| `get-sell-price` | Calculate return for selling tokens |
| `get-pool-info` | Get pool reserves and status |
| `create-pool` | Initialize bonding curve pool for token |

---

## Wallet Integration

### Stacks Wallet (Leather/Xverse)
Primary wallet support through @stacks/connect v8.

### WalletConnect
Mobile wallet connectivity via QR code scanning. Project ID required.

### Implementation
```typescript
import { connect } from '@stacks/connect';

await connect({
  walletConnectProjectId: 'your-project-id',
  network: 'mainnet',
});
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Clarinet 3.11+
- Stacks wallet (Leather or Xverse)

### Frontend
```bash
cd frontend
npm install
cp env.template .env.local
npm run dev
# Opens at http://localhost:3000
```

### Backend
```bash
cd backend
npm install
cp env.template .env
npm start
# API at http://localhost:3001
```

### Smart Contracts
```bash
# Check contracts
clarinet check

# Run tests
npm test

# Deploy to mainnet
clarinet deployments apply --mainnet
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info and available endpoints |
| `/api/health` | GET | Health check and service status |
| `/api/stats` | GET | Real-time platform statistics (tokens launched, 24h volume, graduated, active traders) |
| `/api/tokens` | GET | List all tokens (mainnet-filtered) |
| `/api/tokens/trending` | GET | Get trending tokens by market cap |
| `/api/tokens/:symbol` | GET | Get token by symbol or ID |
| `/api/tokens/:id/trades` | GET | Get trade history for a token |
| `/api/activity` | GET | Recent trade activity feed (mainnet-filtered) |
| `/api/leaderboard` | GET | Top traders by volume (mainnet-filtered) |
| `/api/chainhook` | POST | Chainhook webhook handler for blockchain events |

### Production API

**Backend URL:** `https://stacksfun-production.up.railway.app`

All endpoints automatically filter for mainnet addresses (`SP...`) when `STACKS_NETWORK=mainnet`.

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_STACKS_NETWORK=mainnet
NEXT_PUBLIC_CONTRACT_DEPLOYER=SP1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX32N685T
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_HIRO_API_KEY=your_hiro_key
```

### Backend (.env)
```
PORT=3001
STACKS_NETWORK=mainnet
CONTRACT_DEPLOYER=SP1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX32N685T
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Note:** Railway automatically sets `PORT`. Use `SUPABASE_SERVICE_ROLE_KEY` (not anon key) for backend operations.

---

## Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Stacks Connect v8
- WalletConnect

### Backend
- Node.js
- Express
- Supabase (PostgreSQL)
- Hiro Chainhooks

### Smart Contracts
- Clarity 4
- Stacks Blockchain
- Epoch 3.3

---

## How It Works

1. **Create Token** - Define name, symbol, description, and image. Token is deployed instantly to Stacks blockchain.
2. **Trade with USDCx** - Buy and sell on linear bonding curve. Price starts at $0.0001 and increases as tokens are sold.
3. **Graduate** - At **$69,000 USDC market cap**, liquidity automatically migrates to ALEX DEX.

### Bonding Curve Mechanics

- **Starting Price:** $0.0001 per token
- **Initial Rate:** ~10,000 tokens per $1 USDC
- **Graduation Threshold:** $69,000 market cap
- **Price Formula:** Linear bonding curve (price increases with supply)

### Fee Structure

| Fee | Recipient | Amount |
|-----|-----------|--------|
| Platform | Treasury | 1% |
| Creator | Token creator | 1% |

---

## Roadmap

### Phase 1 - Core System (Completed)
- Bonding curve smart contracts
- Token factory with registration
- STX trading support

### Phase 2 - USDCx Support (Completed)
- USDCx bonding curve contract
- Circle xReserve integration
- Dual-token support

### Phase 3 - Frontend (Completed)
- Token creation flow
- Trading interface
- Portfolio management

### Phase 4 - Mainnet (Completed)
- Contract deployment
- WalletConnect integration
- Production API on Railway
- Frontend deployment on Vercel
- Real-time stats and mainnet filtering
- USDCx-based trading (all prices in USD)

### Phase 5 - Production Launch (Completed)
- Database cleanup and reset scripts
- Mainnet address filtering (SP addresses only)
- Real-time platform statistics
- Currency display standardization (USD/USDC)
- Production-ready deployment

---

## Contributing

Contributions welcome. Please open an issue or submit a pull request.

## License

MIT

## Acknowledgments

- Stacks Foundation
- Hiro Systems
- ALEX Lab
- Circle (USDCx)

---

## Database Management

### Reset for Production Launch

To start fresh for production, run in Supabase SQL Editor:

```sql
-- Delete all data
DELETE FROM trades;
DELETE FROM activity;
DELETE FROM leaderboard;
DELETE FROM tokens;
```

See `backend/migrations/reset-for-launch.sql` for the complete script.

### Cleanup Testnet Data

To remove testnet data (ST addresses) from mainnet database:

```sql
DELETE FROM trades WHERE token_id IN (SELECT id FROM tokens WHERE creator LIKE 'ST%');
DELETE FROM activity WHERE address LIKE 'ST%';
DELETE FROM leaderboard WHERE address LIKE 'ST%';
DELETE FROM tokens WHERE creator LIKE 'ST%';
```

See `backend/migrations/cleanup-testnet-data.sql` for details.

---

## Production Deployment

### Frontend (Vercel)
- **URL:** https://stacksfun.vercel.app
- Auto-deploys from `main` branch
- Environment variables configured in Vercel dashboard

### Backend (Railway)
- **URL:** https://stacksfun-production.up.railway.app
- Auto-deploys from `main` branch
- Connected to Supabase PostgreSQL database
- Chainhook webhooks configured for real-time event indexing

---

Built for Stacks Builder Challenge
