# Deployment Guide

Deploy Stacks.fun to production using Vercel (frontend) and Railway/Render (backend).

## Frontend Deployment (Vercel)

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts, then set environment variables:
vercel env add NEXT_PUBLIC_STACKS_NETWORK
vercel env add NEXT_PUBLIC_CONTRACT_DEPLOYER
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_HIRO_API_KEY
```

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import from GitHub: `unclekaldoteth/stacks.fun`
3. Set Root Directory: `frontend`
4. Add Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_STACKS_NETWORK` | `testnet` |
| `NEXT_PUBLIC_CONTRACT_DEPLOYER` | `ST1ZGGS886YCZHMFXJR1EK61ZP34FNWNSX28M1PMM` |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` |
| `NEXT_PUBLIC_HIRO_API_KEY` | Your Hiro API key |

---

## Backend Deployment (Railway)

### Option 1: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
cd backend
railway init
railway up
```

### Option 2: Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `unclekaldoteth/stacks.fun`
4. Set Root Directory: `backend`
5. Add Environment Variables:

| Variable | Value |
|----------|-------|
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `STACKS_NETWORK` | `testnet` |
| `SUPABASE_URL` | Your Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase key |
| `CHAINHOOK_SECRET` | Your webhook secret |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |

---

## Post-Deployment

### 1. Update Chainhooks

After deployment, update your Chainhooks on [platform.hiro.so](https://platform.hiro.so):

- Change webhook URL from ngrok to your Railway backend URL
- Example: `https://stacks-fun-backend.railway.app/api/chainhook`

### 2. Update Frontend API URL

Set `NEXT_PUBLIC_API_URL` in Vercel to your Railway backend URL.

### 3. Test the Deployment

```bash
# Check backend health
curl https://your-backend.railway.app/api/health

# Check frontend
open https://your-frontend.vercel.app
```

---

## Alternative: Render.com (Backend)

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node index.js`
5. Add environment variables (same as Railway)

---

## Domain Setup (Optional)

### Vercel Custom Domain
1. Go to Project Settings → Domains
2. Add your domain (e.g., `stacks.fun`)
3. Update DNS records as instructed

### Railway Custom Domain
1. Go to Service Settings → Networking
2. Add custom domain
3. Update DNS records
