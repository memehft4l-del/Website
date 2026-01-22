# 🔧 Install Solana CLI to Fix Cargo Version

## Quick Install

Run this command to install Solana CLI (which includes a newer Cargo):

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

Then add to your PATH (add to ~/.zshrc for permanent):

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

Reload your shell:
```bash
source ~/.zshrc
```

Then verify:
```bash
solana --version
cargo --version  # Should show newer version
```

Then try building:
```bash
cd /Users/biggucci/ClashRoyale
anchor clean
anchor build
```

## Alternative: Just Run Frontend

If you don't want to install Solana CLI right now:

```bash
npm run dev
```

The frontend works perfectly without the program deployed!
