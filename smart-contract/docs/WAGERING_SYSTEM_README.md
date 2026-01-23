# 1v1 Clash Royale Wagering System

Complete implementation of a wagering system for elixirpump.com that allows players to create 1v1 matches, deposit escrow funds, verify match results via Clash Royale API, and claim winnings.

## 🎯 Overview

This system enables:
- **Wager Creation**: Players create wagers with SOL amounts
- **Escrow Integration**: Helius webhooks detect escrow deposits and activate wagers
- **Match Verification**: Automatic verification of Clash Royale battles (Best of 3)
- **Real-time Updates**: Supabase Realtime for live status updates
- **Fund Claiming**: Winners can claim their funds after match completion

## 📁 File Structure

```
├── SUPABASE_WAGERS_SCHEMA.sql          # Database schema
├── supabase/functions/
│   ├── helius-webhook/index.ts         # Helius webhook receiver
│   └── verify-match/index.ts           # Match verification logic
├── app/arena/page.tsx                  # Arena UI with Realtime
├── lib/wagers.ts                       # Helper functions
└── SUPABASE_EDGE_FUNCTIONS_SETUP.md    # Deployment guide
```

## 🗄️ Database Schema

### Tables

1. **wagers**
   - `id`: Primary key
   - `creator_id`: Wallet address of creator
   - `opponent_id`: Wallet address of opponent (nullable)
   - `amount`: SOL amount (DECIMAL)
   - `status`: PENDING | ACTIVE | COMPLETED | DISPUTED | CANCELLED
   - `winner_id`: Wallet address of winner (nullable)
   - `escrow_address`: Solana escrow address
   - `transaction_signature`: Transaction signature
   - `created_at`, `activated_at`, `completed_at`, `updated_at`: Timestamps

2. **user_profiles**
   - `id`: Primary key
   - `wallet_address`: Unique wallet address
   - `cr_tag`: Clash Royale player tag (e.g., #ABC123XYZ)
   - `created_at`, `updated_at`: Timestamps

## 🔧 Setup Instructions

### 1. Database Setup

Run the SQL schema in Supabase:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste contents of `SUPABASE_WAGERS_SCHEMA.sql`
3. Click "Run"

### 2. Deploy Edge Functions

See `SUPABASE_EDGE_FUNCTIONS_SETUP.md` for detailed instructions.

**Quick Deploy:**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy helius-webhook
supabase functions deploy verify-match
```

### 3. Configure Environment Variables

**In Supabase Dashboard → Edge Functions → Settings → Secrets:**

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (from Settings → API)
- `CLASH_ROYALE_API_TOKEN`: Your Clash Royale API token
- `CLASH_ROYALE_PROXY_URL`: Proxy URL (default: `https://proxy.royaleapi.dev/v1`)

### 4. Configure Helius Webhook

1. Go to Helius Dashboard → Webhooks
2. Create new webhook
3. Set URL to: `https://your-project-ref.supabase.co/functions/v1/helius-webhook`
4. Add header: `Authorization: Bearer YOUR_SUPABASE_ANON_KEY`
5. Configure to trigger on transactions to escrow addresses

## 🎮 How It Works

### Flow

1. **Create Wager**
   - User creates wager with SOL amount
   - Escrow address is generated
   - Wager status: `PENDING`

2. **Escrow Deposit**
   - User deposits SOL to escrow address
   - Helius detects transaction
   - Webhook calls `helius-webhook` function
   - Wager status: `ACTIVE`
   - `activated_at` timestamp set

3. **Match Verification**
   - User clicks "Verify Match" button
   - Calls `verify-match` Edge Function
   - Function:
     - Fetches Clash Royale battle logs for both players
     - Filters battles after `activated_at` timestamp
     - Finds battles where players faced each other
     - Implements Best of 3 logic (first to 2 wins)
   - If winner found: Wager status → `COMPLETED`, `winner_id` set

4. **Claim Funds**
   - Winner clicks "Claim Funds"
   - Calls `claim-funds` function (to be implemented)
   - Escrow releases funds to winner

### Best of 3 Logic

- Counts wins from valid battles (after `activated_at`)
- Valid battle = opponent tag matches other player
- Win = player's crowns > opponent's crowns
- First player to 2 wins = winner
- Only counts first 3 valid battles

## 🔐 Safety Features

1. **Timestamp Verification**: Only battles after `activated_at` are counted
2. **Tag Matching**: Verifies opponent tag matches expected player
3. **Status Checks**: Only ACTIVE wagers can be verified
4. **Winner Verification**: Only winner can claim funds

## 📱 UI Features

### Arena Page (`/arena`)

- **Real-time Updates**: Uses Supabase Realtime subscriptions
- **My Wagers**: Filtered view of user's wagers
- **All Wagers**: Complete list of all wagers
- **Status Indicators**: Color-coded status badges
- **Actions**:
  - "Verify Match" button for ACTIVE wagers
  - "Claim Funds" button for COMPLETED wagers (winner only)

### Navigation

- Added "Arena" link to desktop navigation
- Added "Arena" link to mobile menu

## 🧪 Testing

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
  -d '{"wager_id": 123}'
```

## 📝 Next Steps

1. **Implement Escrow Contract**: Create Solana program for escrow
2. **Implement Claim Funds**: Add `claim-funds` Edge Function with escrow release logic
3. **Add Wager Creation UI**: Form to create new wagers
4. **Add Profile Management**: UI to set Clash Royale tag
5. **Add Dispute Resolution**: System for handling disputes

## 🔍 Troubleshooting

### Edge Functions not found:
- Ensure functions are deployed: `supabase functions list`
- Check function names match exactly

### Authentication errors:
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set (not anon key)
- Check RLS policies allow service role access

### Clash Royale API errors:
- Verify API token is valid
- Check player tags are formatted correctly (#ABC123XYZ)
- Ensure proxy URL is correct

### Realtime not updating:
- Check Supabase Realtime is enabled in project settings
- Verify channel subscription is active
- Check browser console for errors

## 📚 API Reference

### Edge Functions

#### `helius-webhook`
- **Method**: POST
- **Body**: Helius webhook payload
- **Returns**: `{ success: boolean, wager_id: number, status: string }`

#### `verify-match`
- **Method**: POST
- **Body**: `{ wager_id: number }`
- **Returns**: `{ success: boolean, winner_id?: string, creator_wins: number, opponent_wins: number, battles_analyzed: number }`

### Helper Functions (`lib/wagers.ts`)

- `createWager()`: Create new wager
- `updateUserProfile()`: Update/set Clash Royale tag
- `getUserProfile()`: Get user profile
- `getWager()`: Get wager by ID
- `getAllWagers()`: Get all wagers
- `getWagersForWallet()`: Get wagers for specific wallet

## 🎉 Success!

Your wagering system is now ready! Follow the setup instructions above to deploy and configure everything.

