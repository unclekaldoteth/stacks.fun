# Stacks.fun Token Launchpad

A decentralized token launchpad built on Stacks with bonding curves, secured by Bitcoin. Launch tokens, trade on automated market makers, and graduate to ALEX DEX.

Stacks.fun enables anyone to create and trade tokens using automated bonding curve pricing. Supports STX and USDCx with seamless wallet integration including WalletConnect for mobile wallets.

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
- 2% creator fee on all trades
- Automatic liquidity graduation to ALEX DEX

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

### Smart Contracts (Clarity 3)

- **Launchpad Factory**
  Token registration and metadata management.

- **Bonding Curve V2**
  Quadratic AMM with STX support and dynamic pricing.

- **Bonding Curve USDCx**
  USDCx stablecoin trading with Circle xReserve integration.

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
- REST endpoints for tokens and activity
- Real-time price feeds
- User portfolio tracking
- Chainhook event indexing

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
- **Clarity Version:** 3
- **Epoch:** 3.0
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
| `buy` | Purchase tokens with USDCx |
| `sell` | Sell tokens for USDCx |
| `get-current-price` | Get current token price in USDCx |

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
| `/api/tokens` | GET | List all tokens |
| `/api/tokens/trending` | GET | Get trending tokens |
| `/api/tokens/:symbol` | GET | Get token by symbol |
| `/api/activity` | GET | Recent trade activity |
| `/api/stats` | GET | Platform statistics |

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
SUPABASE_ANON_KEY=your_supabase_key
```

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
- Clarity 3
- Stacks Blockchain
- Epoch 3.0

---

## How It Works

1. **Create Token** - Define name, symbol, description, and image
2. **Trade** - Buy and sell on bonding curve (Price = k * supply^2)
3. **Graduate** - At 100K STX market cap, migrate to ALEX DEX

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
- Production API

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

Built for Stacks Builder Challenge
