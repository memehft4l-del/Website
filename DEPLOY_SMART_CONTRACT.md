# 🚀 Deploy Smart Contract Guide

## Current Situation

Your Solana program build is failing locally due to Anchor using an old Cargo version (1.84.0) that doesn't support `edition2024`. However, **GitHub Actions has newer Cargo** and can build successfully!

## Option 1: Deploy via GitHub Actions (Recommended) ✅

I've created a GitHub Actions workflow that will automatically build and deploy your program when you push to GitHub.

### Steps:

1. **Push your code** (already done! ✅)
   ```bash
   git push new-repo main
   ```

2. **Add Solana Keypair Secret to GitHub** (if you want to use your existing keypair):
   - Go to: https://github.com/memehft4l-del/new/settings/secrets/actions
   - Click "New repository secret"
   - Name: `SOLANA_PRIVATE_KEY`
   - Value: Your private key array from `~/.config/solana/id.json`
   - Click "Add secret"

   **OR** let GitHub Actions generate a new keypair (it will airdrop SOL automatically)

3. **Trigger the workflow:**
   - Go to: https://github.com/memehft4l-del/new/actions
   - Click "Build and Deploy Solana Program"
   - Click "Run workflow" → "Run workflow"
   - Watch it build and deploy!

4. **Verify deployment:**
   ```bash
   solana program show Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY --url devnet
   ```

   Check Solscan: https://solscan.io/account/Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY?cluster=devnet

## Option 2: Manual Build with Updated Cargo

If you want to build locally, you need to update your Solana installation:

```bash
# Update Rust toolchain
rustup update stable
rustup default stable

# Update Solana CLI (includes newer Cargo)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Add to PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Verify Cargo version (should be 1.90+)
cargo --version

# Build
cd /Users/biggucci/ClashRoyale
anchor clean
anchor build

# Deploy
solana program deploy target/deploy/clash_royale_escrow.so \
  --url devnet \
  --program-id programs/clash-royale-escrow/target/deploy/clash_royale_escrow-keypair.json
```

## Option 3: Use Pre-built Binary (If Available)

If you have a `.so` file from a previous build:

```bash
cd /Users/biggucci/ClashRoyale

# Deploy directly
solana program deploy target/deploy/clash_royale_escrow.so \
  --url devnet \
  --program-id programs/clash-royale-escrow/target/deploy/clash_royale_escrow-keypair.json
```

## Verify Deployment

After deployment, verify it worked:

```bash
# Check program account
solana program show Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY --url devnet

# Should show:
# - Executable: Yes ✓
# - ProgramData Address: ...
# - Authority: ...
```

View on Solscan:
https://solscan.io/account/Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY?cluster=devnet

## What Works Without Deployment

The frontend works perfectly without the program deployed:
- ✅ Website loads
- ✅ Wallet connection
- ✅ Token balance display
- ✅ Tournament signups
- ✅ Dashboard
- ✅ All UI features

**Only Arena wagering needs the deployed program.**

## Recommended Approach

**Use GitHub Actions** - it's the easiest and most reliable way to build and deploy. Just push your code and let GitHub Actions handle it!


