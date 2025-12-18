# StacksPad Smart Contracts

## Overview

This directory contains the Clarity smart contracts for the StacksPad NFT Launchpad platform.

## Contract: stackspad-nft.clar

A SIP-009 compliant NFT contract with launchpad features:

### Features

- **SIP-009 Compliance**: Full NFT standard implementation
- **Whitelist Support**: Phase-based minting with whitelist
- **Minting Limits**: Per-wallet mint limits
- **Reveal Mechanism**: Hidden metadata until reveal
- **Batch Operations**: Bulk whitelist and airdrop
- **Admin Controls**: Price, supply, and window management

### Error Codes

| Code | Name | Description |
|------|------|-------------|
| u100 | ERR-NOT-AUTHORIZED | Caller is not authorized |
| u101 | ERR-NOT-FOUND | Token not found |
| u102 | ERR-SOLD-OUT | Max supply reached |
| u103 | ERR-MINT-NOT-STARTED | Mint hasn't started |
| u104 | ERR-MINT-ENDED | Mint has ended |
| u105 | ERR-WRONG-PRICE | Incorrect payment |
| u106 | ERR-NOT-WHITELISTED | Address not on whitelist |
| u110 | ERR-MAX-PER-WALLET | Wallet limit reached |

## Development

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) v1.7+

### Install Clarinet

```bash
# macOS
brew install clarinet

# Or via cargo
cargo install clarinet
```

### Run Tests

```bash
clarinet test
```

### Check Contract

```bash
clarinet check
```

### Console (REPL)

```bash
clarinet console
```

## Deployment

### Testnet

```bash
clarinet deployments generate --testnet
clarinet deployments apply --testnet
```

### Mainnet

```bash
clarinet deployments generate --mainnet
clarinet deployments apply --mainnet
```

## Contract Functions

### Read-Only

- `get-last-token-id` - Get total minted count
- `get-token-uri` - Get metadata URI for token
- `get-owner` - Get token owner
- `get-mint-info` - Get mint configuration
- `is-whitelisted` - Check if address is whitelisted
- `is-mint-active` - Check if minting is active

### Public (Users)

- `mint` - Mint single NFT
- `transfer` - Transfer NFT

### Admin Only

- `add-to-whitelist` - Add addresses to whitelist
- `remove-from-whitelist` - Remove from whitelist
- `set-whitelist-only` - Enable/disable whitelist mode
- `set-mint-price` - Update mint price
- `set-mint-window` - Set start/end blocks
- `set-max-supply` - Update max supply
- `set-max-per-wallet` - Update per-wallet limit
- `set-base-uri` - Set metadata base URI
- `reveal` - Reveal collection metadata
- `airdrop` - Send NFT to address
- `batch-airdrop` - Bulk airdrop
- `withdraw-stx` - Withdraw contract balance
