# .env.local Template

Add these environment variables to your `.env.local` file:

```bash
# Solana Program ID (Devnet)
NEXT_PUBLIC_WAGER_ESCROW_PROGRAM_ID=Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY

# Solana Network (devnet or mainnet-beta)
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# RPC Endpoint (Devnet)
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
# Or use Helius Devnet: https://devnet.helius-rpc.com/?api-key=YOUR_KEY

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clash Royale API
NEXT_PUBLIC_CLASH_ROYALE_API_TOKEN=your_clash_royale_api_token

# Token Mint Address
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=your_token_mint_address

# Social Links (optional)
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/your_handle
NEXT_PUBLIC_TELEGRAM_URL=https://t.me/your_channel
```

## Supabase Edge Function Environment Variables

Set these in Supabase Dashboard → Project Settings → Edge Functions:

```bash
# Solana Backend Authority (Private Key as JSON array)
SOLANA_BACKEND_PRIVATE_KEY=[123,45,67,...]  # Your backend wallet private key as JSON array

# Wager Escrow Program ID
WAGER_ESCROW_PROGRAM_ID=Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY

# Platform Treasury Address
PLATFORM_TREASURY=YourPlatformTreasuryAddressHere111111111111111111111111

# RPC Endpoint (for Edge Functions)
RPC_ENDPOINT=https://api.devnet.solana.com

# Clash Royale API Proxy (MUST use proxy.royaleapi.dev)
CLASH_ROYALE_PROXY_URL=https://proxy.royaleapi.dev/v1

# Clash Royale API Token
CLASH_ROYALE_API_TOKEN=your_clash_royale_api_token
```

## How to Get Backend Authority Private Key

1. Generate a new Solana keypair:
```bash
solana-keygen new --outfile ~/.config/solana/backend-authority.json
```

2. Export the private key as JSON array:
```bash
cat ~/.config/solana/backend-authority.json | jq -c '.[:32]'
```

3. Copy the output and paste it as `SOLANA_BACKEND_PRIVATE_KEY` in Supabase Edge Functions environment variables.

4. Get the public key:
```bash
solana-keygen pubkey ~/.config/solana/backend-authority.json
```

5. Use this public key as `BACKEND_AUTHORITY` in your Solana program.

