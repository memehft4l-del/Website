# Token Balance Setup Guide

## How Token Balances Work

Yes, the app **needs your token mint address** to check balances! Here's how it works:

### How It Works:
1. **Token Mint Address**: This is the unique identifier for your $ELIXIR token on Solana
2. **Wallet Connection**: When a user connects their wallet, we get their wallet address
3. **Balance Check**: We query the Solana blockchain to find all token accounts for that wallet that hold your specific token
4. **Tier Calculation**: Based on the balance, we determine their tier (Minnow/Squire/Whale)

### Current Configuration:
- **Token Mint Address**: Currently set to SOL placeholder (`So11111111111111111111111111111111111111112`)
- **Location**: `lib/constants.ts` or `.env.local`

## Setting Your Token Mint Address

### Option 1: Environment Variable (Recommended)
1. Open `.env.local` file
2. Add your token mint address:
   ```
   NEXT_PUBLIC_TOKEN_MINT_ADDRESS=YOUR_TOKEN_MINT_ADDRESS_HERE
   ```
3. Restart the dev server: `npm run dev`

### Option 2: Direct Edit
1. Open `lib/constants.ts`
2. Replace the placeholder with your token mint address:
   ```typescript
   export const TOKEN_MINT_ADDRESS = "YOUR_TOKEN_MINT_ADDRESS_HERE";
   ```

## Finding Your Token Mint Address

If you've already launched your token:
- Check your token launch platform (Pump.fun, Raydium, etc.)
- Look in your Solana wallet's token list
- Check Solscan/Solana Explorer for your token

If you haven't launched yet:
- You'll get the mint address when you create the token
- Save it immediately - you'll need it!

## Testing

Once you set the token address:
1. Connect a wallet that holds your token
2. Go to Dashboard tab
3. You should see the balance and tier

## Important Notes

- The token mint address is **public** - it's safe to include in your code
- Make sure it's the **mainnet** address (not devnet/testnet)
- The address should be a valid Solana public key (base58 encoded, ~44 characters)


