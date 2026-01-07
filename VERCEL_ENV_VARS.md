# Vercel Environment Variables Setup

Add these environment variables in your Vercel project settings.

## Required Environment Variables

Add each of these in the Vercel dashboard:

### 1. Token Mint Address
- **Key:** `NEXT_PUBLIC_TOKEN_MINT_ADDRESS`
- **Value:** Your $ELIXIR token contract address
- **Example:** `So11111111111111111111111111111111111111112`
- **Environments:** Production, Preview, Development

### 2. Solana RPC Endpoint
- **Key:** `NEXT_PUBLIC_RPC_ENDPOINT`
- **Value:** Your Helius RPC URL with API key
- **Example:** `https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY`
- **Environments:** Production, Preview, Development

### 3. Supabase URL
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Your Supabase project URL
- **Example:** `https://cwihyzlbsbbpchkheito.supabase.co`
- **Environments:** Production, Preview, Development

### 4. Supabase Anonymous Key
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Your Supabase anonymous/public key
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Environments:** Production, Preview, Development

### 5. Clash Royale API Token (Optional)
- **Key:** `NEXT_PUBLIC_CLASH_ROYALE_API_TOKEN`
- **Value:** Your Clash Royale API token
- **Example:** `your-api-token-here`
- **Environments:** Production, Preview, Development
- **Note:** This is optional - the app works without it (uses direct links to RoyaleAPI)

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. For each variable above:
   - Click **"Add Another"**
   - Enter the **Key** (exactly as shown above)
   - Enter the **Value** (from your `.env.local` file)
   - Select **"All Environments"** (or specific ones)
   - Click **"Save"**

## Quick Import Option

If you have a `.env.local` file, you can:
1. Click **"Import .env"** button in Vercel
2. Paste the contents of your `.env.local` file
3. Vercel will automatically parse and add the variables

## Important Notes

- ✅ All variables starting with `NEXT_PUBLIC_` are exposed to the browser
- ✅ Make sure values match exactly what's in your `.env.local`
- ✅ After adding variables, redeploy your project for changes to take effect
- ⚠️ Never commit `.env.local` to GitHub (it's already in `.gitignore`)

## After Adding Variables

1. Go to **Deployments** tab
2. Click the **"..."** menu on your latest deployment
3. Click **"Redeploy"**
4. Wait for the build to complete

Your site should now be fully connected!

