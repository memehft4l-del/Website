# 🚀 Deploy Smart Contract - Quick Guide

## The Problem
Your local build fails because Anchor uses Cargo 1.84.0 (too old). **GitHub Actions has newer Cargo** and can build it!

## Solution: Deploy via GitHub Actions

### Step 1: Add Workflow File Manually

Since your GitHub token doesn't have `workflow` scope, add the workflow file manually:

1. Go to: https://github.com/memehft4l-del/new
2. Click "Add file" → "Create new file"
3. Path: `.github/workflows/deploy-program.yml`
4. Copy the contents from the file I created (see below)
5. Click "Commit new file"

**OR** update your GitHub token to include `workflow` scope:
- Go to: https://github.com/settings/tokens
- Edit your token
- Check "workflow" scope
- Then push the workflow file

### Step 2: Add Solana Keypair Secret (Optional)

If you want to use your existing keypair:

1. Go to: https://github.com/memehft4l-del/new/settings/secrets/actions
2. Click "New repository secret"
3. Name: `SOLANA_PRIVATE_KEY`
4. Value: Copy the array from `~/.config/solana/id.json`
5. Click "Add secret"

**OR** let GitHub Actions generate a new keypair (it will airdrop SOL automatically)

### Step 3: Trigger Deployment

1. Go to: https://github.com/memehft4l-del/new/actions
2. Click "Build and Deploy Solana Program"
3. Click "Run workflow" → "Run workflow"
4. Watch it build and deploy!

### Step 4: Verify

```bash
solana program show Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY --url devnet
```

Check Solscan: https://solscan.io/account/Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY?cluster=devnet

---

## Alternative: Manual Deployment (If You Can Build)

If you update your Solana installation locally:

```bash
# Update Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Build
cd /Users/biggucci/ClashRoyale
anchor build

# Deploy
solana program deploy target/deploy/clash_royale_escrow.so \
  --url devnet \
  --program-id programs/clash-royale-escrow/target/deploy/clash_royale_escrow-keypair.json
```

---

## Workflow File Contents

The workflow file is already created at `.github/workflows/deploy-program.yml` in your local repo. You just need to push it manually or update your token scope.

