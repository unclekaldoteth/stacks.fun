# Chainhook Setup Guide

Configure Chainhooks to receive real-time blockchain events for the Stacks Token Launchpad.

## Prerequisites

1. **Hiro API Key** - Get from [platform.hiro.so](https://platform.hiro.so/)
2. **Public Backend URL** - Your backend must be accessible from the internet
3. **Deployed Contracts** - Contracts must be deployed on testnet/mainnet

## Quick Start

### 1. Set Environment Variables

Add these to your `backend/.env`:

```bash
# Hiro Platform API Key
HIRO_API_KEY=your_hiro_api_key_here

# Your public backend URL (use ngrok for local dev)
WEBHOOK_URL=https://your-backend.com

# Secret to verify webhook requests
CHAINHOOK_SECRET=your_secure_secret_here

# Network (testnet or mainnet)
STACKS_NETWORK=testnet
```

### 2. Local Development with ngrok

For local testing, use [ngrok](https://ngrok.com/) to expose your backend:

```bash
# Start your backend
cd backend && npm run dev

# In another terminal, expose it
ngrok http 3001
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and set it as `WEBHOOK_URL`.

### 3. Register Chainhooks

```bash
# Install dependencies
cd backend && npm install node-fetch

# Register chainhooks for testnet
node scripts/register-chainhooks.js --network testnet

# Or register for mainnet
node scripts/register-chainhooks.js --network mainnet
```

## Contract Addresses

### Testnet
- **Deployer**: `ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM`
- **launchpad-factory**: `ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM.launchpad-factory`
- **bonding-curve**: `ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM.bonding-curve`
- **alex-graduation**: `ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM.alex-graduation`

### Mainnet
Update `MAINNET_DEPLOYER` in the registration script with your mainnet address.

## Events Captured

| Event | Contract | Method | Description |
|-------|----------|--------|-------------|
| Token Created | launchpad-factory | `register-token` | New token registered |
| Token Buy | bonding-curve | `buy` | Tokens purchased |
| Token Sell | bonding-curve | `sell` | Tokens sold |
| Graduation | alex-graduation | `graduate-token` | Token graduated to DEX |

## Webhook Payload Format

Chainhook sends POST requests to `/api/chainhook` with this structure:

```json
{
  "apply": [
    {
      "block_identifier": { "index": 12345, "hash": "0x..." },
      "timestamp": 1640000000,
      "transactions": [
        {
          "transaction_identifier": { "hash": "0x..." },
          "status": "success",
          "metadata": {
            "sender": "ST...",
            "kind": {
              "ContractCall": {
                "contract_identifier": "ST...launchpad-factory",
                "function_name": "register-token"
              }
            },
            "receipt": {
              "events": [...]
            }
          }
        }
      ]
    }
  ]
}
```

## Testing

Send a test payload to your backend:

```bash
curl -X POST http://localhost:3001/api/chainhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret" \
  -d @backend/mock-payload.json
```

## Monitoring

Watch backend logs for incoming events:

```
📩 Received Chainhook event
🔄 Processing transaction: 0x...
🪙 Token created event
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check `CHAINHOOK_SECRET` matches |
| Events not received | Verify webhook URL is publicly accessible |
| Missing events | Check contract addresses match |
| Empty payload | Ensure transaction was successful |

## Resources

- [Hiro Chainhooks Docs](https://docs.hiro.so/chainhook)
- [Hiro Platform](https://platform.hiro.so/)
- [Stacks Explorer](https://explorer.stacks.co/)
