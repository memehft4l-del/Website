# Supabase Edge Functions Setup Guide

This guide explains how to deploy and configure the Supabase Edge Functions for the 1v1 Clash Royale wagering system.

## Prerequisites

1. **Supabase CLI**: Install the Supabase CLI
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

## Edge Functions

### 1. Helius Webhook Receiver (`helius-webhook`)

This function receives webhooks from Helius when transactions are detected and updates wager status to ACTIVE.

**Deploy:**
```bash
supabase functions deploy helius-webhook
```

**Environment Variables (set in Supabase Dashboard):**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (from Settings → API)

**Webhook URL:**
After deployment, you'll get a URL like:
```
https://your-project-ref.supabase.co/functions/v1/helius-webhook
```

**Configure in Helius:**
1. Go to Helius Dashboard → Webhooks
2. Create a new webhook
3. Set the URL to your Edge Function URL
4. Configure webhook to trigger on transactions to your escrow addresses
5. Add authentication header: `Authorization: Bearer YOUR_SUPABASE_ANON_KEY`

### 2. Verify Match (`verify-match`)

This function verifies Clash Royale match results by checking battle logs and implements Best of 3 logic.

**Deploy:**
```bash
supabase functions deploy verify-match
```

**Environment Variables:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `CLASH_ROYALE_PROXY_URL`: Proxy URL for Clash Royale API (default: `https://proxy.royaleapi.dev/v1`)
- `CLASH_ROYALE_API_TOKEN`: Your Clash Royale API token

**Usage:**
Call from your frontend or via API:
```typescript
const { data, error } = await supabase.functions.invoke("verify-match", {
  body: { wager_id: 123 }
});
```

### 3. Claim Funds (`claim-funds`) - Optional

This function handles the escrow release when a winner claims their funds.

**Deploy:**
```bash
supabase functions deploy claim-funds
```

**Note:** You'll need to implement the actual Solana escrow release logic based on your escrow contract.

## Setting Environment Variables

1. Go to Supabase Dashboard → Edge Functions
2. Select your function
3. Go to Settings → Secrets
4. Add each environment variable

Or use CLI:
```bash
supabase secrets set CLASH_ROYALE_API_TOKEN=your-token-here
supabase secrets set CLASH_ROYALE_PROXY_URL=https://proxy.royaleapi.dev/v1
```

## Testing Edge Functions

### Test Helius Webhook:
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/helius-webhook \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction": {
      "signature": "test-signature",
      "slot": 12345,
      "timestamp": 1234567890
    },
    "accountData": [
      {
        "account": "escrow-address-here",
        "nativeBalanceChange": 1000000000
      }
    ]
  }'
```

### Test Verify Match:
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/verify-match \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "wager_id": 123
  }'
```

## Database Setup

Before using the Edge Functions, make sure you've run the SQL schema:

1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of `SUPABASE_WAGERS_SCHEMA.sql`
3. This creates the `wagers` and `user_profiles` tables

## Troubleshooting

### Function not found:
- Make sure you've deployed the function: `supabase functions deploy function-name`
- Check the function name matches exactly

### Authentication errors:
- Verify your `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Make sure you're using the service role key, not the anon key

### Clash Royale API errors:
- Verify your API token is valid
- Check that the proxy URL is correct
- Ensure player tags are formatted correctly (with #)

### Database errors:
- Verify the tables exist: `wagers` and `user_profiles`
- Check RLS policies allow the service role to read/write
- Verify column names match the schema

## Next Steps

1. Deploy all Edge Functions
2. Set up Helius webhook to point to `helius-webhook`
3. Test the verify-match function with a test wager
4. Implement the claim-funds escrow release logic
5. Test the full flow: Create wager → Escrow deposit → Verify match → Claim funds


