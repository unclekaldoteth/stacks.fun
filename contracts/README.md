# Stacks.fun Smart Contracts

## Overview

This directory contains the Clarity smart contracts for the Stacks.fun Token Launchpad platform - a pump.fun-style token launcher on Stacks blockchain.

## Deployed Contracts (Mainnet)

**Deployer Address:** `SP1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX32N685T`

| Contract | Description |
|----------|-------------|
| `sip-010-trait` | SIP-010 fungible token trait definition |
| `launchpad-factory` | Token registration and metadata management |
| `bonding-curve` | Original STX bonding curve (v1) |
| `bonding-curve-v2` | Improved STX trading with better tokenomics |
| `bonding-curve-usdcx` | USDCx stablecoin trading (Circle xReserve) |
| `alex-graduation` | ALEX DEX migration logic |
| `launchpad-token` | SIP-010 token template |
| `mock-usdcx` | Mock USDCx for local testing only |

## Contract Architecture

### launchpad-factory.clar

Token registry that manages token metadata and registration.

**Key Functions:**
- `register-token` - Register new token with name, symbol, image, description
- `get-token-info` - Get token details by ID
- `set-graduated` - Mark token as graduated to DEX
- `get-token-count` - Get total registered tokens

### bonding-curve-v2.clar (Recommended for STX)

Implements a linear bonding curve for STX trading with improved tokenomics.

**Key Parameters:**
- Initial Price: 0.0001 STX per token
- Graduation Threshold: ~69,000 STX market cap
- Total Supply: 1 billion tokens
- Curve Supply: 800M tokens (80%)
- Platform Fee: 1%
- Creator Fee: 1%

**Key Functions:**
- `create-pool` - Initialize a new token pool
- `buy` - Purchase tokens with STX
- `sell` - Sell tokens for STX
- `get-current-price` - Get current token price
- `get-buy-price` - Calculate cost to buy amount
- `get-sell-price` - Calculate return for selling
- `get-pool-info` - Get pool reserves and status
- `get-user-balance` - Get user's token balance

### bonding-curve-usdcx.clar

Same bonding curve logic but with USDCx (Circle xReserve) payments instead of STX.

**USDCx Contract:** `SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx`

### alex-graduation.clar

Handles token graduation from bonding curve to ALEX DEX liquidity.

### Error Codes

| Code | Name | Description |
|------|------|-------------|
| u200 | ERR-NOT-AUTHORIZED | Caller is not authorized |
| u201 | ERR-INSUFFICIENT-BALANCE | User doesn't have enough tokens |
| u202 | ERR-INSUFFICIENT-STX | Pool doesn't have enough STX |
| u203 | ERR-SLIPPAGE-TOO-HIGH | Trade exceeds slippage tolerance |
| u204 | ERR-TOKEN-NOT-FOUND | Token/pool doesn't exist |
| u205 | ERR-ALREADY-GRADUATED | Token already graduated to DEX |
| u206 | ERR-NOT-GRADUATED | Token hasn't graduated yet |
| u207 | ERR-ZERO-AMOUNT | Cannot trade zero amount |

## Clarity 4 Features

These contracts are built with **Clarity 4** ([SIP-033](https://docs.stacks.co/whats-new/latest-updates#clarity-4-is-now-live)), which includes:

- `stacks-block-time` - Get timestamp of current block
- `contract-hash?` - On-chain contract verification
- `restrict-assets?` - Contracts can set post-conditions
- `to-ascii?` - Convert values to ASCII strings
- `secp256r1-verify` - Native passkey integration

## Development

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) v3.11+

### Install Clarinet

```bash
# macOS
brew install clarinet

# Or via cargo
cargo install clarinet
```

### Check Contracts

```bash
clarinet check
```

### Run Tests

```bash
npm test
# or
clarinet test
```

### Console (REPL)

```bash
clarinet console
```

## Deployment

### Generate Deployment Plan

```bash
# Testnet
clarinet deployments generate --testnet

# Mainnet
clarinet deployments generate --mainnet
```

### Deploy

```bash
# Testnet
clarinet deployments apply --testnet

# Mainnet (requires mnemonic in settings/Mainnet.toml or env var)
clarinet deployments apply --mainnet
```

## Security Considerations

1. **Never commit mnemonics** - Keep wallet seed phrases in environment variables
2. **Verify contract addresses** - Double-check addresses before mainnet deployment
3. **Test thoroughly** - Run all tests before deployment
4. **Monitor transactions** - Watch for unusual activity after launch

## Explorer Links

View contracts on Stacks Explorer:
https://explorer.hiro.so/address/SP1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX32N685T?chain=mainnet
