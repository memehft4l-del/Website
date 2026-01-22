# Devnet Configuration Guide

Complete guide for configuring the wagering system for Solana Devnet.

## ✅ Configuration Complete

All components have been updated for Devnet:

### 1. RPC Endpoints
- **Frontend**: `https://api.devnet.solana.com` (or Helius Devnet)
- **Backend**: Uses Devnet RPC for all Edge Functions
- **Environment Variable**: `NEXT_PUBLIC_RPC_ENDPOINT` (optional, defaults to Devnet)

### 2. Wallet Provider
- **Network**: `WalletAdapterNetwork.Devnet`
- **Location**: `components/WalletProvider.tsx`

### 3. Wager Limits
- **Default**: 0.001 SOL
- **Available Amounts**: `[0.001]` (Devnet only)
- **Location**: `lib/constants.ts`

### 4. Smart Contract
- **Program ID**: Update `NEXT_PUBLIC_WAGER_ESCROW_PROGRAM_ID` with your Devnet deployment
- **Location**: `lib/solana/wagerEscrow.ts`

### 5. Edge Functions
- **verify-match**: Updated for Devnet RPC and 60-minute timeout
- **helius-webhook**: Updated for Devnet transaction signatures
- **cancel-wager**: Updated for 60-minute timeout

### 6. UI Updates
- **Devnet Badge**: Visible in Arena header
- **Warning Text**: "Test Mode - Not Real SOL"
- **Timeout Display**: Shows 60-minute timeout for stuck matches

## 🔧 Environment Variables

Add to `.env.local`:

```env
# Devnet RPC (optional - defaults to public Devnet)
NEXT_PUBLIC_RPC_ENDPOINT=https://devnet.helius-rpc.com/?api-key=YOUR_KEY

# Devnet Program ID (update after deployment)
NEXT_PUBLIC_WAGER_ESCROW_PROGRAM_ID=YourDevnetProgramIDHere

# Network indicator (optional)
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

## 🚀 Deployment Steps

### 1. Deploy Escrow Program to Devnet

```bash
# Set cluster to devnet
solana config set --url devnet

# Airdrop SOL for testing
solana airdrop 2

# Build and deploy
anchor build
anchor deploy --provider.cluster devnet

# Save program ID
solana address -k target/deploy/clash_royale_escrow-keypair.json
```

### 2. Update Program ID

Update `.env.local`:
```env
NEXT_PUBLIC_WAGER_ESCROW_PROGRAM_ID=YourDevnetProgramIDHere
```

### 3. Deploy Edge Functions

```bash
# Deploy verify-match
supabase functions deploy verify-match

# Deploy helius-webhook
supabase functions deploy helius-webhook

# Deploy cancel-wager
supabase functions deploy cancel-wager
```

### 4. Configure Helius Webhook (Devnet)

1. Go to Helius Dashboard → Webhooks
2. Create webhook pointing to `helius-webhook` Edge Function
3. **Network**: Select "Devnet"
4. Configure to trigger on escrow address transactions
5. Set authorization header with Supabase anon key

## 🎮 Best of 3 Verification Logic

The `verify-match` function implements strict Best of 3 logic:

### Filtering
1. **Opponent Filter**: Only counts matches where UserA.tag played UserB.tag
2. **Time Filter**: Only counts games where `battleTime > wager_activated_at`
3. **Limit**: Analyzes up to 3 battles (Best of 3)

### Resolution Logic
- **Player A has 2 wins** → Resolve Wager (A wins)
- **Player B has 2 wins** → Resolve Wager (B wins)
- **Score is 1-1** → Wait for 3rd game
- **60 minutes timeout** → Cancel/Refund option becomes available

### Timeout Handling
- If 60 minutes pass and no 2nd/3rd game appears
- The "Cancel/Refund" button becomes available in UI
- Both players can cancel and receive refunds

## 🧪 Testing Checklist

- [ ] Connect wallet to Devnet
- [ ] See Devnet badge in Arena UI
- [ ] Create wager with 0.001 SOL
- [ ] Join wager from different wallet
- [ ] Verify match detection works correctly
- [ ] Test Best of 3 logic (1-1 scenario)
- [ ] Test immediate resolution at 2 wins
- [ ] Test 60-minute timeout cancellation
- [ ] Verify funds distribution (95% winner, 5% platform)

## 🔐 Security Notes

1. **Devnet Only**: All transactions use test SOL, not real funds
2. **Program ID**: Must match your deployed Devnet program
3. **RPC Endpoint**: Use Helius Devnet for reliability
4. **Webhook**: Ensure Helius webhook is configured for Devnet network

## 📊 Monitoring

Monitor these metrics in Devnet:
- Wager creation rate
- Match verification success rate
- Average time to resolution
- Cancellation rate (should be low)
- Platform fee collection

## 🐛 Troubleshooting

### "Program account not found"
- Verify program ID is correct
- Check program is deployed to Devnet
- Ensure RPC endpoint is Devnet

### "Insufficient funds"
- Users need Devnet SOL for wager + transaction fees
- Get Devnet SOL: `solana airdrop 2`

### "Stuck match not cancelable"
- Verify 60 minutes have passed
- Check verify-match confirms 0 games
- Ensure wager status is ACTIVE

### "Best of 3 not resolving"
- Check battle logs are being fetched correctly
- Verify timestamp filtering is working
- Ensure opponent tags match correctly

## ✅ Production Checklist

Before moving to Mainnet:
- [ ] All Devnet tests passing
- [ ] Program ID updated for Mainnet
- [ ] RPC endpoint switched to Mainnet
- [ ] WalletProvider set to Mainnet
- [ ] Wager amounts updated (0.25 SOL increments)
- [ ] Edge Functions updated for Mainnet
- [ ] Helius webhook configured for Mainnet
- [ ] Devnet badge removed from UI

