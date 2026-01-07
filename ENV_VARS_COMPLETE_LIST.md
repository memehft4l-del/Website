# Complete List of Environment Variables for Vercel

Copy these **exactly** into your Vercel project settings.

## Required Environment Variables

Add these in **Vercel Dashboard** → **Settings** → **Environment Variables**:

### 1. Token Mint Address (REQUIRED)
```
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=4W7cM6SUuqhv9jp2t3jfmonXzNbDsJt5PCWqt7w1Axa2
```
- **What it is:** Your $ELIXIR token contract address
- **Required:** Yes
- **Environments:** All (Production, Preview, Development)

### 2. Solana RPC Endpoint (REQUIRED)
```
NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
```
- **What it is:** Your Helius RPC URL with API key
- **Required:** Yes (or use free public RPC as fallback)
- **Environments:** All (Production, Preview, Development)
- **Note:** Replace `YOUR_HELIUS_KEY` with your actual Helius API key

### 3. Supabase URL (REQUIRED)
```
NEXT_PUBLIC_SUPABASE_URL=https://cwihyzlbsbbpchkheito.supabase.co
```
- **What it is:** Your Supabase project URL
- **Required:** Yes
- **Environments:** All (Production, Preview, Development)
- **Note:** Replace with your actual Supabase project URL

### 4. Supabase Anonymous Key (REQUIRED)
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Y_MINoKzOLp1DBG23X0HZg_NR9gXzSk
```
- **What it is:** Your Supabase anonymous/public key
- **Required:** Yes
- **Environments:** All (Production, Preview, Development)
- **Note:** Replace with your actual Supabase anon key

### 5. Clash Royale API Token (OPTIONAL)
```
NEXT_PUBLIC_CLASH_ROYALE_API_TOKEN=your-clash-royale-api-token
```
- **What it is:** Your Clash Royale API token
- **Required:** No (app works without it - uses direct links to RoyaleAPI)
- **Environments:** All (Production, Preview, Development)
- **Note:** Only add if you have a Clash Royale API token

## Quick Copy-Paste Format

Copy this entire block and paste into Vercel's "Import .env" feature:

```env
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=4W7cM6SUuqhv9jp2t3jfmonXzNbDsJt5PCWqt7w1Axa2
NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
NEXT_PUBLIC_SUPABASE_URL=https://cwihyzlbsbbpchkheito.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Y_MINoKzOLp1DBG23X0HZg_NR9gXzSk
```

**Important:** Replace:
- `YOUR_HELIUS_KEY` with your actual Helius API key
- Supabase URL and key with your actual values (if different)

## How to Add in Vercel

### Method 1: Individual Entry
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. For each variable above:
   - Click **"Add Another"**
   - Enter the **Key** (exactly as shown)
   - Enter the **Value** (from your `.env.local` file)
   - Select **"All Environments"** ✅
   - Click **"Save"**

### Method 2: Import .env File
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Click **"Import .env"** button
3. Paste the contents of your `.env.local` file
4. Vercel will automatically parse and add all variables
5. Make sure to select **"All Environments"** for each variable

## Verification Checklist

After adding variables, verify:
- [ ] All 4 required variables are added
- [ ] Each variable is set for "All Environments"
- [ ] No extra spaces or quotes around values
- [ ] Values match exactly what's in your `.env.local` file
- [ ] Redeployed after adding variables

## After Adding Variables

1. Go to **Deployments** tab
2. Click **"..."** on your latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete (2-3 minutes)
5. Your site should now work! 🎉

## Troubleshooting

If your site still shows errors after adding variables:

1. **Check Build Logs** in Vercel for specific errors
2. **Check Browser Console** (F12) for client-side errors
3. **Verify** all variable names start with `NEXT_PUBLIC_`
4. **Make sure** there are no typos in variable names
5. **Redeploy** after making any changes

## Current Values (From Your .env.local)

Based on your current setup:
- Token Address: `4W7cM6SUuqhv9jp2t3jfmonXzNbDsJt5PCWqt7w1Axa2`
- Supabase URL: `https://cwihyzlbsbbpchkheito.supabase.co`
- Supabase Key: `sb_publishable_Y_MINoKzOLp1DBG23X0HZg_NR9gXzSk`
- RPC Endpoint: Check your `.env.local` for your Helius key

