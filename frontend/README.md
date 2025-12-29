# Stacks.fun Frontend

Next.js frontend for the Stacks.fun token launchpad platform.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, TypeScript, Tailwind CSS
- **Wallet:** @stacks/connect v8, WalletConnect
- **API:** Hiro Platform API

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp env.template .env.local

# Configure your .env.local with:
# - NEXT_PUBLIC_HIRO_API_KEY (from https://platform.hiro.so/)
# - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (from https://cloud.reown.com/)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_STACKS_NETWORK` | `mainnet` or `testnet` | Yes |
| `NEXT_PUBLIC_CONTRACT_DEPLOYER` | Contract deployer address | Yes |
| `NEXT_PUBLIC_HIRO_API_KEY` | Hiro Platform API key | Yes |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | Recommended |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_APP_NAME` | App name for wallet | No |

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage - token feed
│   ├── create/            # Create new token
│   ├── token/[symbol]/    # Token detail page
│   ├── launch/[id]/       # Launch detail page
│   ├── marketplace/       # Token marketplace
│   ├── activity/          # Activity feed
│   ├── leaderboard/       # Top traders
│   ├── profile/           # User profile
│   └── how-it-works/      # Documentation
├── components/            # React components
│   ├── Navbar.tsx         # Navigation
│   ├── Sidebar.tsx        # Sidebar navigation
│   ├── TradePanel.tsx     # Buy/sell interface
│   ├── TokenCard.tsx      # Token display card
│   ├── BondingCurveChart.tsx  # Price chart
│   ├── WalletProvider.tsx # Wallet context
│   └── ...
├── lib/                   # Utilities
│   ├── contracts.ts       # Contract interactions
│   ├── stacks.ts          # Stacks utilities
│   ├── api.ts             # Backend API client
│   └── hiro.ts            # Hiro API client
└── config.ts              # App configuration
```

## Key Features

### Wallet Integration

Supports multiple Stacks wallets:
- **Leather** - Browser extension
- **Xverse** - Browser extension  
- **WalletConnect** - Mobile wallets via QR code

```typescript
import { connect } from '@stacks/connect';

await connect({
  walletConnectProjectId: 'your-project-id',
  network: 'mainnet',
});
```

### Contract Interactions

All contract calls are in `lib/contracts.ts`:

```typescript
import { buyTokens, sellTokens, registerToken } from '@/lib/contracts';

// Buy tokens
await buyTokens(tokenContract, stxAmount, minTokens, {
  onFinish: (data) => console.log('TX:', data.txId),
});

// Sell tokens
await sellTokens(tokenContract, tokenAmount, minStx);

// Register new token
await registerToken(name, symbol, imageUri, description);
```

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Environment for Production

Set these in your Vercel dashboard:

```
NEXT_PUBLIC_STACKS_NETWORK=mainnet
NEXT_PUBLIC_CONTRACT_DEPLOYER=SP1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX32N685T
NEXT_PUBLIC_HIRO_API_KEY=your_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Stacks.js Documentation](https://docs.stacks.co/docs/stacks-academy/stacks-js)
- [Hiro Platform](https://platform.hiro.so/)
