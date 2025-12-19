# Stacks.fun 🚀

A token launchpad on the Stacks blockchain with bonding curves, secured by Bitcoin.

**Live Demo:** [stacksfun.vercel.app](https://stacksfun.vercel.app)

## 🎯 Overview

Stacks.fun enables anyone to launch tokens on Stacks using an automated bonding curve. When tokens reach sufficient market cap, they graduate to ALEX DEX for full trading.

### Key Features

- **No-code token creation** - Launch SIP-010 tokens instantly
- **Bonding curve AMM** - Automated pricing with guaranteed liquidity
- **ALEX DEX graduation** - Automatic liquidity migration at 100K STX
- **Real-time events** - Chainhook integration for live updates
- **Creator rewards** - 2% of all trades go to token creators

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│   Supabase      │
│   (Next.js)     │     │   (Express)     │     │   (Postgres)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       ▲
        │                       │
        ▼               ┌───────┴───────┐
┌─────────────────┐     │  Chainhooks   │
│   Stacks        │     │  (Hiro)       │
│   Blockchain    │─────┴───────────────┘
└─────────────────┘
```

## 📦 Smart Contracts

| Contract | Description |
|----------|-------------|
| `launchpad-factory` | Token registration and management |
| `bonding-curve` | AMM with quadratic pricing |
| `alex-graduation` | DEX migration logic |
| `launchpad-token` | SIP-010 token template |

**Testnet Deployer:** `ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM`

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, Supabase
- **Blockchain:** Stacks, Clarity smart contracts
- **Infra:** Vercel, Railway, Hiro Chainhooks

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Clarinet CLI
- Stacks wallet (Leather/Xverse)

### Setup

```bash
# Clone repository
git clone https://github.com/unclekaldoteth/stacks.fun.git
cd stacks.fun

# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# Configure environment
cp frontend/.env.template frontend/.env.local
cp backend/env.template backend/.env

# Run locally
cd frontend && npm run dev  # localhost:3000
cd backend && npm run dev   # localhost:3001
```

### Deploy Contracts

```bash
# Test contracts
clarinet test

# Deploy to testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

## 📊 How It Works

1. **Create Token** - Define name, symbol, description
2. **Trade** - Buy/sell on bonding curve (P = k × supply²)
3. **Graduate** - At 100K STX, migrate to ALEX DEX

### Fee Structure

| Fee | Recipient | Amount |
|-----|-----------|--------|
| Platform | Treasury | 2% |
| Creator | Token creator | 2% |

## 🔗 Links

- **Live App:** [stacksfun.vercel.app](https://stacksfun.vercel.app)
- **API:** [stacksfun-production.up.railway.app](https://stacksfun-production.up.railway.app)
- **Stacks:** [stacks.co](https://stacks.co)
- **ALEX Lab:** [alexlab.co](https://alexlab.co)

## 📄 License

MIT

---

Built for Stacks Builder Challenge 🧱
