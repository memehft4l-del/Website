# Supabase Dashboard Verification Guide

This guide helps verify that your Supabase database is updating correctly.

## Quick Verification Checklist

### 1. Environment Variables ✅
- [x] `NEXT_PUBLIC_SUPABASE_URL` is set
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set

### 2. Database Tables

Run this SQL in Supabase SQL Editor to verify all tables exist:

```sql
-- Check if all required tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('wagers', 'user_profiles', 'tournament_signups')
ORDER BY table_name;
```

### 3. Real-time Subscriptions

**Enable Real-time for Tables:**
1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for:
   - ✅ `wagers` table
   - ✅ `user_profiles` table
   - ✅ `tournament_signups` table

### 4. Row Level Security (RLS)

Verify RLS policies exist:

```sql
-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Required Policies:**

**For `wagers` table:**
- Allow SELECT for all users
- Allow INSERT for authenticated users (or public if needed)
- Allow UPDATE for authenticated users (or public if needed)

**For `user_profiles` table:**
- Allow SELECT for all users
- Allow INSERT for all users
- Allow UPDATE for all users (or own records only)

**For `tournament_signups` table:**
- Allow SELECT for all users
- Allow INSERT for all users

### 5. Test Data Flow

#### Test 1: Insert User Profile
```sql
-- Insert a test user profile
INSERT INTO user_profiles (wallet_address, cr_tag, total_points)
VALUES ('test-wallet-123', '#TEST123', 100)
ON CONFLICT (wallet_address) DO UPDATE 
SET cr_tag = EXCLUDED.cr_tag, updated_at = NOW()
RETURNING *;
```

#### Test 2: Update User Profile
```sql
-- Update the test profile
UPDATE user_profiles
SET total_points = 200, updated_at = NOW()
WHERE wallet_address = 'test-wallet-123'
RETURNING *;
```

#### Test 3: Check Leaderboard View
```sql
-- Query leaderboard view
SELECT * FROM leaderboard LIMIT 10;
```

### 6. Verify Real-time Updates

**In Supabase Dashboard:**
1. Go to Database → Replication
2. Check that `wagers` and `user_profiles` have replication enabled
3. The status should show "Active"

**Test Real-time:**
1. Open your app in one browser tab
2. Open Supabase Dashboard → Table Editor → `user_profiles` in another tab
3. Update a record in Supabase Dashboard
4. Check if the app updates automatically (should refresh within 1-2 seconds)

### 7. Common Issues & Fixes

#### Issue: "permission denied for table"
**Fix:** Check RLS policies - you may need to allow public access:
```sql
-- Example: Allow public SELECT on user_profiles
CREATE POLICY "Allow public select" ON user_profiles
FOR SELECT TO public USING (true);
```

#### Issue: Real-time not working
**Fix:** Enable replication in Supabase Dashboard:
1. Database → Replication
2. Toggle ON for `wagers` and `user_profiles`

#### Issue: Leaderboard view not updating
**Fix:** The view should auto-update when `user_profiles` changes. Verify:
```sql
-- Check if view exists
SELECT * FROM leaderboard LIMIT 1;

-- Refresh the view definition
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  wallet_address,
  cr_tag,
  total_points,
  games_won,
  games_lost,
  CASE 
    WHEN games_won + games_lost > 0 
    THEN ROUND((games_won::DECIMAL / (games_won + games_lost)) * 100, 2)
    ELSE 0 
  END as win_rate,
  total_winnings,
  win_streak,
  best_win_streak,
  updated_at
FROM user_profiles
WHERE total_points > 0 OR games_won > 0 OR games_lost > 0
ORDER BY total_points DESC, games_won DESC, win_rate DESC;
```

### 8. Monitoring Updates

**Check Recent Updates:**
```sql
-- Check recent wager updates
SELECT id, creator_id, status, updated_at 
FROM wagers 
ORDER BY updated_at DESC 
LIMIT 10;

-- Check recent user profile updates
SELECT wallet_address, total_points, updated_at 
FROM user_profiles 
ORDER BY updated_at DESC 
LIMIT 10;
```

**Check Update Frequency:**
```sql
-- Count updates in last hour
SELECT 
  COUNT(*) as updates_last_hour
FROM user_profiles
WHERE updated_at > NOW() - INTERVAL '1 hour';
```

### 9. Verification Script

Run the verification script:
```bash
# Install tsx if needed
npm install -D tsx

# Run verification
npx tsx scripts/verify-supabase.ts
```

## Expected Behavior

✅ **Working Correctly:**
- Tables exist and are accessible
- Insert/update operations succeed
- Real-time subscriptions receive updates
- Leaderboard view returns data
- Updates appear in dashboard within 1-2 seconds

❌ **Not Working:**
- Connection errors
- Permission denied errors
- Real-time updates not received
- Tables missing columns
- Views not accessible

## Next Steps

1. ✅ Verify environment variables are set
2. ✅ Run table existence check
3. ✅ Enable real-time replication
4. ✅ Test insert/update operations
5. ✅ Verify real-time subscriptions work
6. ✅ Check RLS policies
7. ✅ Test leaderboard view

If all checks pass, your Supabase dashboard should be updating correctly! 🎉

