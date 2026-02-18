# Supabase Dashboard Status & Verification

## Current Configuration ✅

### Environment Variables
- ✅ `NEXT_PUBLIC_SUPABASE_URL`: Set
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Set

### Real-time Subscriptions Configured

**Admin Dashboard** (`app/admin/page.tsx`):
- ✅ Subscribes to `wagers` table changes
- ✅ Auto-refreshes when wagers are updated
- ✅ Auto-cancels wagers older than 1 hour

**Arena Page** (`app/arena/page.tsx`):
- ✅ Subscribes to `wagers` table changes
- ✅ Logs updates to console
- ✅ Auto-refreshes wager list

**Leaderboard** (`components/Leaderboard.tsx`):
- ✅ Subscribes to `user_profiles` table changes
- ✅ Auto-refreshes leaderboard when profiles update

## Database Tables

Based on `SUPABASE_GAMES_SCHEMA.sql`:

1. **`wagers`** - Stores 1v1 wager information
   - Columns: id, creator_id, opponent_id, amount, status, winner_id, etc.
   - Real-time: ✅ Enabled in code

2. **`user_profiles`** - Stores user stats and profiles
   - Columns: wallet_address, cr_tag, total_points, games_won, games_lost, etc.
   - Real-time: ✅ Enabled in code

3. **`tournament_signups`** - Tournament registrations
   - Columns: id, wallet_address, clash_royale_username, tier, created_at
   - Real-time: Not currently subscribed (but table exists)

4. **`leaderboard`** - View for leaderboard display
   - Based on `user_profiles` table
   - Auto-updates when `user_profiles` changes

## How Updates Work

### 1. Wager Updates
- **Source**: Admin dashboard actions, Arena page actions
- **Flow**: 
  1. User/admin performs action (create, join, verify, pay)
  2. Code calls `supabase.from("wagers").update()` or `.insert()`
  3. Real-time subscription detects change
  4. `fetchWagers()` is called automatically
  5. UI updates with new data

### 2. User Profile Updates
- **Source**: Points system (`lib/points.ts`), Profile updates
- **Flow**:
  1. Points are awarded after matches
  2. Code calls `supabase.from("user_profiles").upsert()`
  3. Real-time subscription detects change
  4. Leaderboard refreshes automatically
  5. User stats update in Arena page

### 3. Tournament Signups
- **Source**: Tournament signup form
- **Flow**:
  1. User signs up via `TournamentSignupForm`
  2. Code calls `supabase.from("tournament_signups").insert()`
  3. Tournament Monitor displays updated list

## Verification Steps

### Step 1: Check Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Database** → **Tables**
4. Verify these tables exist:
   - ✅ `wagers`
   - ✅ `user_profiles`
   - ✅ `tournament_signups`

### Step 2: Enable Real-time Replication
1. Go to **Database** → **Replication**
2. Enable replication for:
   - ✅ `wagers` table
   - ✅ `user_profiles` table
   - ⚠️ If replication is OFF, real-time won't work!

### Step 3: Check Row Level Security (RLS)
1. Go to **Authentication** → **Policies**
2. Or run in SQL Editor:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

**Required Policies:**
- `wagers`: SELECT, INSERT, UPDATE (public or authenticated)
- `user_profiles`: SELECT, INSERT, UPDATE (public or authenticated)
- `tournament_signups`: SELECT, INSERT (public or authenticated)

### Step 4: Test Real-time Updates
1. Open your app in browser
2. Open browser console (F12)
3. Open Supabase Dashboard → Table Editor → `wagers`
4. Manually update a wager status
5. Check browser console - should see "Wager update received:" log
6. App should refresh automatically

### Step 5: Test Data Insertion
Run this in Supabase SQL Editor:
```sql
-- Test insert
INSERT INTO user_profiles (wallet_address, cr_tag, total_points)
VALUES ('test-' || NOW()::text, '#TEST', 100)
ON CONFLICT (wallet_address) DO UPDATE 
SET total_points = EXCLUDED.total_points, updated_at = NOW()
RETURNING *;
```

Then check if it appears in:
- Leaderboard page
- Arena stats (if wallet is connected)

## Common Issues

### ❌ Real-time not working
**Symptoms**: Changes in Supabase don't appear in app automatically

**Fixes**:
1. Enable replication in Supabase Dashboard → Database → Replication
2. Check browser console for subscription errors
3. Verify RLS policies allow SELECT

### ❌ Permission denied errors
**Symptoms**: "permission denied for table" errors

**Fixes**:
1. Check RLS policies - may need to allow public access
2. Verify anon key is correct
3. Check if table exists

### ❌ Updates not saving
**Symptoms**: Changes don't persist

**Fixes**:
1. Check for errors in browser console
2. Verify `.update()` or `.upsert()` calls succeed
3. Check RLS policies allow INSERT/UPDATE

### ❌ Leaderboard not updating
**Symptoms**: Leaderboard shows old data

**Fixes**:
1. Verify `leaderboard` view exists
2. Check if `user_profiles` table is updating
3. Refresh the page (view should auto-update)

## Quick Health Check

Run this SQL in Supabase SQL Editor:

```sql
-- Check table row counts
SELECT 
  'wagers' as table_name, COUNT(*) as row_count FROM wagers
UNION ALL
SELECT 
  'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 
  'tournament_signups', COUNT(*) FROM tournament_signups;

-- Check recent updates
SELECT 
  'wagers' as table_name,
  MAX(updated_at) as last_update
FROM wagers
UNION ALL
SELECT 
  'user_profiles',
  MAX(updated_at)
FROM user_profiles;
```

## Next Steps

1. ✅ Verify tables exist in Supabase Dashboard
2. ✅ Enable real-time replication for `wagers` and `user_profiles`
3. ✅ Test real-time updates by manually editing a record
4. ✅ Check browser console for subscription logs
5. ✅ Verify RLS policies allow necessary operations

If all checks pass, your Supabase dashboard should be updating correctly! 🎉

