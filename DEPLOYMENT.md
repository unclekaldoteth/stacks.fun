# StacksPad Mainnet Deployment Guide

## Pre-Deployment Checklist

- [ ] Contract tested thoroughly on testnet
- [ ] Contract audited (recommended for production)
- [ ] STX available for deployment fees (~10-50 STX)
- [ ] Metadata API ready and deployed
- [ ] Whitelist addresses compiled
- [ ] Treasury wallet address finalized

## Deployment Steps

### 1. Install Clarinet

```bash
brew install clarinet
# or
cargo install clarinet
```

### 2. Configure Mainnet Wallet

Create a deployment wallet and fund it with STX for gas fees:

```bash
# Generate new wallet (save the mnemonic securely!)
clarinet wallets generate
```

### 3. Update Clarinet.toml

Add your mainnet deployer:

```toml
[project.mainnet]
name = "stackspad"
node = "https://stacks-node-api.mainnet.stacks.co"

[[accounts]]
name = "deployer"
mnemonic = "YOUR_MNEMONIC_HERE"
```

### 4. Verify Contract

```bash
clarinet check
```

### 5. Deploy to Testnet First

```bash
# Generate testnet deployment plan
clarinet deployments generate --testnet

# Deploy to testnet
clarinet deployments apply --testnet
```

### 6. Test on Testnet

- Verify all functions work
- Test minting flow
- Test whitelist
- Test reveal
- Test transfers

### 7. Deploy to Mainnet

```bash
# Generate mainnet deployment plan
clarinet deployments generate --mainnet

# Review the deployment plan
cat deployments/default.mainnet-plan.yaml

# Execute deployment
clarinet deployments apply --mainnet
```

### 8. Post-Deployment Configuration

After deployment, configure your launch:

```clarity
;; Set mint price (in micro-STX, e.g., 50 STX = 50000000)
(contract-call? .stackspad-nft set-mint-price u50000000)

;; Set max supply
(contract-call? .stackspad-nft set-max-supply u10000)

;; Set max per wallet
(contract-call? .stackspad-nft set-max-per-wallet u5)

;; Add whitelist addresses
(contract-call? .stackspad-nft add-to-whitelist (list 
    'SP123...
    'SP456...
))

;; Set mint window (block heights)
(contract-call? .stackspad-nft set-mint-window u150000 u160000)

;; Set metadata URI
(contract-call? .stackspad-nft set-base-uri u"https://your-api.com/metadata/")

;; When ready to reveal
(contract-call? .stackspad-nft reveal)
```

## Contract Verification

After deployment, verify on the Stacks Explorer:

1. Go to https://explorer.stacks.co
2. Search for your contract address
3. Verify the source code matches
4. Test read-only functions

## Security Recommendations

1. **Use a hardware wallet** for the deployer account
2. **Multi-sig treasury** for receiving mint funds
3. **Timelock important changes** in production
4. **Monitor contract events** using Chainhooks
5. **Have an incident response plan**

## Estimated Costs

- Contract deployment: ~5-20 STX
- Each admin transaction: ~0.01-0.1 STX
- User mints: Paid by minter

## Support

For issues with deployment:
- Stacks Discord: https://discord.gg/stacks
- Clarinet Docs: https://docs.hiro.so/clarinet
