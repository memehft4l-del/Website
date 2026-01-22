# Supabase Edge Functions Deployment Guide

## Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

## Environment Variables Setup

Before deploying, set these environment variables in Supabase Dashboard:

1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add the following secrets:

```bash
SOLANA_BACKEND_PRIVATE_KEY=[123,45,67,...]  # JSON array format
WAGER_ESCROW_PROGRAM_ID=Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY
PLATFORM_TREASURY=YourPlatformTreasuryAddressHere111111111111111111111111
RPC_ENDPOINT=https://api.devnet.solana.com
CLASH_ROYALE_PROXY_URL=https://proxy.royaleapi.dev/v1
CLASH_ROYALE_API_TOKEN=your_clash_royale_api_token
```

## Deploy Edge Functions

### 1. Deploy verify-match Function

```bash
supabase functions deploy verify-match \
  --project-ref your-project-ref \
  --no-verify-jwt
```

### 2. Deploy helius-webhook Function

```bash
supabase functions deploy helius-webhook \
  --project-ref your-project-ref \
  --no-verify-jwt
```

### 3. Deploy cancel-wager Function

```bash
supabase functions deploy cancel-wager \
  --project-ref your-project-ref \
  --no-verify-jwt
```

## Deploy All Functions at Once

```bash
# Deploy all functions
supabase functions deploy verify-match --no-verify-jwt
supabase functions deploy helius-webhook --no-verify-jwt
supabase functions deploy cancel-wager --no-verify-jwt
```

## Verify Deployment

Check your deployed functions:
```bash
supabase functions list
```

## Test Functions

### Test verify-match:
```bash
curl -X POST \
  'https://your-project-ref.supabase.co/functions/v1/verify-match' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"wager_id": "your-wager-id"}'
```

### Test helius-webhook:
```bash
curl -X POST \
  'https://your-project-ref.supabase.co/functions/v1/helius-webhook' \
  -H 'Content-Type: application/json' \
  -d '{"transaction": {"signature": "test-signature"}}'
```

## Function URLs

After deployment, your functions will be available at:

- `https://your-project-ref.supabase.co/functions/v1/verify-match`
- `https://your-project-ref.supabase.co/functions/v1/helius-webhook`
- `https://your-project-ref.supabase.co/functions/v1/cancel-wager`

## Helius Webhook Configuration

1. Go to Helius Dashboard → Webhooks
2. Create a new webhook with:
   - **Webhook URL**: `https://your-project-ref.supabase.co/functions/v1/helius-webhook`
   - **Account Addresses**: Your escrow PDA addresses (or leave empty to monitor all)
   - **Transaction Types**: `TRANSFER`
   - **Network**: `devnet` (or `mainnet-beta` for production)

## Troubleshooting

### Function logs:
```bash
supabase functions logs verify-match
supabase functions logs helius-webhook
supabase functions logs cancel-wager
```

### Check environment variables:
```bash
supabase secrets list
```

### Update a secret:
```bash
supabase secrets set SOLANA_BACKEND_PRIVATE_KEY="[123,45,67,...]"
```

