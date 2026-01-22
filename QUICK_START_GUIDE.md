# 🚀 Quick Start Guide - ClashRoyale Project

## Step 1: Fix Build Issue (Update Rust/Cargo)

The build is failing because Cargo version is too old. Update it:

```bash
# Update Rust to latest stable version
rustup update stable
rustup default stable

# Verify versions (should show 1.90+)
rustc --version
cargo --version
```

## Step 2: Build the Solana Program

Once Rust/Cargo is updated:

```bash
cd /Users/biggucci/ClashRoyale

# Clean previous builds
anchor clean

# Build the program
anchor build
```

**Expected output:**
```
✅ Build success
✅ Generated: target/deploy/clash_royale_escrow.so
```

## Step 3: Deploy to Devnet (Optional)

If you want to deploy the program:

```bash
# Make sure you have SOL in your wallet
solana balance

# If needed, get devnet SOL
solana airdrop 2

# Deploy
anchor deploy --provider.cluster devnet
```

## Step 4: Run the Next.js Frontend

```bash
cd /Users/biggucci/ClashRoyale

# Install dependencies (if not already done)
npm install

# Set up environment variables
# Copy .env.local.example to .env.local and fill in your values
cp .env.local.example .env.local  # If you have an example file
# Or create .env.local manually with:
# NEXT_PUBLIC_WAGER_ESCROW_PROGRAM_ID=Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY
# NEXT_PUBLIC_SOLANA_NETWORK=devnet
# NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
# etc.

# Run the development server
npm run dev
```

The app will be available at: **http://localhost:3000**

## Step 5: Verify Everything Works

1. **Open browser**: http://localhost:3000
2. **Connect wallet**: Click "Connect Wallet" button
3. **Check Dashboard**: Should show your token balance
4. **Check Arena**: Should show wagering interface (if wallet connected)

## Troubleshooting

### Build still fails?
- Make sure Rust/Cargo is updated: `rustc --version` should show 1.90+
- Try: `cargo clean` then `anchor clean` then `anchor build`

### Frontend won't start?
- Check `.env.local` has all required variables
- Run `npm install` to ensure dependencies are installed
- Check console for errors

### Wallet won't connect?
- Make sure you're using Phantom or Solflare wallet
- Check browser console for errors
- Verify `NEXT_PUBLIC_SOLANA_NETWORK=devnet` in `.env.local`

## Current Configuration Status

✅ Anchor version: 0.32.1
✅ Program ID: Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY
✅ Cluster: Devnet
✅ Resolver: 2
✅ Overflow-checks: enabled

## Next Steps After Running

1. Test wallet connection
2. Test token balance display
3. Test tournament signups
4. Test Arena wagering (if deployed)

