# Mainnet Deployment Guide

Complete guide for deploying the wagering system to Solana Mainnet-beta.

## ✅ Completed Features

1. **Tiered Betting**
   - Testing: 0.001 SOL
   - Production: 0.25 SOL increments (0.25, 0.5, 0.75, 1.0, etc.)

2. **Mainnet RPC Integration**
   - Uses Helius Mainnet RPC endpoint
   - 'confirmed' commitment level throughout
   - Strict timestamp checking in verify-match

3. **Improved Best of 3 Logic**
   - Waits for 3rd game if score is 1-1
   - Resolves immediately when player reaches 2 wins
   - Properly handles all match scenarios

4. **Stuck Match Recovery**
   - Cancel button appears after 30 minutes
   - Only available if verify-match confirms 0 games played
   - Refunds both players

## 🔧 Configuration Required

### 1. Update Program ID

After deploying your escrow program to Mainnet:

```bash
# Get your deployed program ID
solana address -k target/deploy/clash_royale_escrow-keypair.json

# Update in .env.local
NEXT_PUBLIC_WAGER_ESCROW_PROGRAM_ID=YourMainnetProgramIDHere
```

### 2. Set Platform Addresses

Update in `lib/solana/wagerEscrow.ts`:

```typescript
export const PLATFORM_TREASURY = new PublicKey(
  "YourPlatformTreasuryAddressHere"
);

export const BACKEND_AUTHORITY = new PublicKey(
  "YourBackendAuthorityAddressHere"
);
```

### 3. Environment Variables

Add to Vercel/Supabase:

```env
# Mainnet RPC (Helius recommended)
NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Escrow Program ID (after deployment)
NEXT_PUBLIC_WAGER_ESCROW_PROGRAM_ID=YourMainnetProgramID

# Backend Authority Secret Key (base64 encoded)
BACKEND_AUTHORITY_SECRET_KEY=base64_encoded_keypair_secret_key
```

## 🚀 Deployment Steps

### Step 1: Deploy Escrow Program to Mainnet

```bash
# Set cluster to mainnet
solana config set --url mainnet-beta

# Ensure you have SOL for deployment
solana balance

# Build and deploy
anchor build
anchor deploy --provider.cluster mainnet-beta

# Save program ID
solana address -k target/deploy/clash_royale_escrow-keypair.json
```

### Step 2: Update Code with Program ID

1. Update `NEXT_PUBLIC_WAGER_ESCROW_PROGRAM_ID` in `.env.local`
2. Update `WAGER_ESCROW_PROGRAM_ID` in `lib/solana/wagerEscrow.ts`
3. Update program ID in `programs/clash-royale-escrow/src/lib.rs`:
   ```rust
   declare_id!("YourMainnetProgramIDHere");
   ```

### Step 3: Deploy Edge Functions

```bash
# Deploy verify-match
supabase functions deploy verify-match

# Deploy cancel-wager
supabase functions deploy cancel-wager

# Set environment variables in Supabase Dashboard
# - RPC_ENDPOINT
# - CLASH_ROYALE_API_TOKEN
# - CLASH_ROYALE_PROXY_URL
# - BACKEND_AUTHORITY_SECRET_KEY
```

### Step 4: Configure Helius Webhook

1. Go to Helius Dashboard → Webhooks
2. Create webhook pointing to `helius-webhook` Edge Function
3. Configure to trigger on escrow address transactions
4. Set authorization header with Supabase anon key

## 🧪 Testing Checklist

- [ ] Create wager with 0.001 SOL (testing) or 0.25 SOL (production)
- [ ] Join wager from different wallet
- [ ] Verify match detection works correctly
- [ ] Test Best of 3 logic (1-1 scenario)
- [ ] Test immediate resolution at 2 wins
- [ ] Test stuck match cancellation (after 30 min, 0 games)
- [ ] Verify funds distribution (95% winner, 5% platform)
- [ ] Test claim funds functionality

## 🔐 Security Notes

1. **Backend Authority**: Store keypair securely, never expose to frontend
2. **RPC Endpoint**: Use Helius or similar reliable provider for Mainnet
3. **Commitment Level**: Always use 'confirmed' for Mainnet reliability
4. **Timestamp Checks**: Strict validation prevents replay attacks
5. **Cancel Protection**: Only allows cancellation if 0 games played

## 📊 Monitoring

Monitor these metrics:
- Wager creation rate
- Match verification success rate
- Average time to resolution
- Cancellation rate
- Platform fee collection

## 🐛 Troubleshooting

### "Program account not found"
- Verify program ID is correct
- Check program is deployed to Mainnet
- Ensure RPC endpoint is Mainnet

### "Insufficient funds"
- Users need SOL for wager + transaction fees
- Check account balances before creating wager

### "Stuck match not cancelable"
- Verify 30 minutes have passed
- Check verify-match confirms 0 games
- Ensure wager status is ACTIVE

### "Best of 3 not resolving"
- Check battle logs are being fetched correctly
- Verify timestamp filtering is working
- Ensure opponent tags match correctly

## ✅ Production Checklist

- [ ] Program deployed to Mainnet
- [ ] Program ID updated in code
- [ ] Platform treasury address set
- [ ] Backend authority keypair secured
- [ ] Edge Functions deployed
- [ ] Environment variables configured
- [ ] Helius webhook configured
- [ ] Testing completed
- [ ] Monitoring set up
- [ ] Documentation updated

