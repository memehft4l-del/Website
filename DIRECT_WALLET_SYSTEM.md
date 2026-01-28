# Direct Wallet Escrow System

## Overview

This system replaces the Solana smart contract escrow with a simpler direct wallet transfer system. All funds go directly to an admin wallet, and matches are tracked and verified in Supabase.

## Key Features

### 1. Direct Wallet Transfers
- Players send SOL directly to admin wallet (`ADMIN_WALLET_ADDRESS`)
- No smart contract needed
- Simpler, faster transactions
- Lower transaction fees

### 2. Supabase Tracking
- All games tracked in `wagers` table
- Verification status: PENDING, VERIFIED, NEEDS_REVIEW, DISPUTED
- Payout status: PENDING, PAID, REFUNDED
- Match results stored as JSONB

### 3. Admin Dashboard
- View all games
- Filter by status (pending, needs review, verified, paid)
- Verify matches automatically or manually
- Mark games as paid
- Track all transactions

### 4. Leaderboard System
- Points tracked by wallet address
- Win/loss records
- Win streaks
- Total winnings
- Real-time updates

### 5. Points System
- **Win**: 100 points
- **Loss**: 10 points (participation)
- **Streak Bonus**: 50 points per win streak (max 500)
- **Wager Bonus**: 10 points per SOL wagered

## Database Schema

### Updated `wagers` Table
```sql
- Removed: escrow_address
- Added: verification_status (PENDING, VERIFIED, NEEDS_REVIEW, DISPUTED)
- Added: payout_status (PENDING, PAID, REFUNDED)
- Added: admin_wallet (wallet that received funds)
- Added: deposit_signature (transaction signature for deposit)
- Added: payout_signature (transaction signature for payout)
- Added: verified_at, paid_at (timestamps)
- Added: match_result (JSONB - stores verification details)
- Added: notes (TEXT - admin notes)
```

### Updated `user_profiles` Table
```sql
- Added: total_points (INTEGER)
- Added: games_won (INTEGER)
- Added: games_lost (INTEGER)
- Added: total_winnings (DECIMAL)
- Added: total_wagered (DECIMAL)
- Added: win_streak (INTEGER)
- Added: best_win_streak (INTEGER)
```

### New `leaderboard` View
```sql
- Real-time leaderboard sorted by points
- Includes win rate calculation
- Shows streaks and winnings
```

## Setup Instructions

### 1. Run Database Migration
```sql
-- Run SUPABASE_GAMES_SCHEMA.sql in Supabase SQL Editor
```

### 2. Update Environment Variables
```env
NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=ZvhrcR6XHRSDcb8A15vrZ89rFaHUBWGVBYY1yadY2sj
```

### 3. Update Edge Functions
- Update `verify-match` function to award points
- Update to mark verification status
- Update to calculate and store match results

## Workflow

### Creating a Wager
1. Player clicks "Create Wager"
2. Wager record created in Supabase (status: PENDING)
3. Player sends SOL to admin wallet
4. Transaction signature stored in `deposit_signature`
5. Wager appears in Arena

### Joining a Wager
1. Player clicks "Join" on a pending wager
2. Player sends SOL to admin wallet (same amount)
3. Wager status updated to ACTIVE
4. `activated_at` timestamp set

### Verifying a Match
1. Admin clicks "Verify Match" in dashboard
2. Edge function calls Clash Royale API
3. Checks battle log for matches between players
4. Implements Best of 3 logic
5. Updates verification_status to VERIFIED
6. Awards points to winner
7. Updates user stats

### Paying Out
1. Admin verifies match is complete
2. Admin sends SOL to winner from admin wallet
3. Admin marks as PAID with payout signature
4. `paid_at` timestamp set

## Admin Dashboard Features

- **Filter Games**: By status, search by wallet/ID
- **Verify Matches**: Automatic or manual verification
- **Track Payments**: Mark games as paid with transaction signatures
- **View Details**: See full match results and notes
- **Real-time Updates**: Supabase Realtime for live updates

## Leaderboard Features

- **Top Players**: Ranked by total points
- **Win Rates**: Percentage calculations
- **Streaks**: Current and best win streaks
- **Winnings**: Total SOL won
- **Real-time**: Updates automatically

## Points Calculation

```typescript
Points = Base Points + Streak Bonus + Wager Bonus

Base Points:
- Win: 100 points
- Loss: 10 points

Streak Bonus (winners only):
- Current Streak × 50 points
- Maximum: 500 points

Wager Bonus:
- Wager Amount × 10 points per SOL
```

## Benefits

✅ **Simpler**: No smart contract complexity
✅ **Faster**: Direct transfers are quicker
✅ **Cheaper**: Lower transaction fees
✅ **Flexible**: Easy to adjust rules and points
✅ **Transparent**: All data in Supabase dashboard
✅ **Scalable**: Can handle many games easily

## Files Created/Updated

- `SUPABASE_GAMES_SCHEMA.sql` - Database schema
- `app/admin/page.tsx` - Admin dashboard
- `components/Leaderboard.tsx` - Leaderboard component
- `app/leaderboard/page.tsx` - Leaderboard page
- `lib/points.ts` - Points calculation system
- `lib/solana/directTransfer.ts` - Direct wallet transfer
- `lib/constants.ts` - Added ADMIN_WALLET_ADDRESS and POINTS_CONFIG
- `app/arena/page.tsx` - Updated to use direct transfers

## Next Steps

1. Run the SQL migration in Supabase
2. Update `verify-match` edge function to award points
3. Add leaderboard link to navigation
4. Test the complete flow
5. Deploy!


