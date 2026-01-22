# 🚀 How to Run the Project RIGHT NOW

## Option 1: Run Frontend Only (Recommended - Works Immediately)

You can run the Next.js frontend without building the Solana program:

```bash
cd /Users/biggucci/ClashRoyale

# Start the development server
npm run dev
```

Then open: **http://localhost:3000**

**What works:**
- ✅ Website loads
- ✅ Wallet connection
- ✅ Token balance display
- ✅ Tournament signups
- ✅ Dashboard
- ✅ All UI features

**What won't work (until program is deployed):**
- ❌ Creating wagers in Arena (needs deployed program)
- ❌ On-chain transactions (needs deployed program)

## Option 2: Fix Build Issue First

The build is failing because Anchor is using an old Cargo. Try:

```bash
# Clear Anchor's cached Cargo
rm -rf ~/.cargo/registry/src/index.crates.io-*/constant_time_eq-0.4.2

# Update Cargo cache
cargo update

# Try building again
cd /Users/biggucci/ClashRoyale
anchor clean
anchor build
```

## Option 3: Use Pre-built Program (If Available)

If you have a pre-built `.so` file, you can deploy it directly:

```bash
solana program deploy target/deploy/clash_royale_escrow.so \
  --url devnet \
  --program-id programs/clash-royale-escrow/target/deploy/clash_royale_escrow-keypair.json
```

## Quick Start (Frontend Only)

```bash
# Just run this:
npm run dev

# Then open browser:
open http://localhost:3000
```

The frontend will work fine - you just won't be able to create wagers until the program is deployed.
