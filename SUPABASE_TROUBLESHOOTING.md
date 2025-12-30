# Supabase Troubleshooting Guide

## Error: "Could not find the 'clash_royale_username' column"

This error means the table either doesn't exist or has incorrect column names. Follow these steps:

### Step 1: Run the Fix SQL

1. Go to your Supabase Dashboard: https://app.supabase.com/project/cwihyzlbsbbpchkheito
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `SUPABASE_FIX.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 2: Refresh Schema Cache

After running the SQL:

1. Go to **Table Editor** in the left sidebar
2. You should see `tournament_signups` table
3. Click on it to verify the columns:
   - `id` (bigint)
   - `wallet_address` (text)
   - `clash_royale_username` (text)
   - `tier` (text)
   - `created_at` (timestamp)

### Step 3: Verify Table Structure

Run this query in SQL Editor to verify:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tournament_signups';
```

You should see:
- `id` (bigint)
- `wallet_address` (text)
- `clash_royale_username` (text)
- `tier` (text)
- `created_at` (timestamp with time zone)

### Step 4: Test the Connection

After creating the table, refresh your browser and try signing up again.

## Alternative: Check Existing Table

If the table already exists but with different column names, run this to see what columns exist:

```sql
SELECT * FROM tournament_signups LIMIT 1;
```

If you see different column names, you may need to either:
1. Drop and recreate the table (use SUPABASE_FIX.sql)
2. Or update the code to match your existing column names

## Still Having Issues?

1. **Check Supabase Logs**: Go to Logs → API Logs to see detailed error messages
2. **Verify API Key**: Make sure your `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches the "anon public" key from Settings → API
3. **Check RLS Policies**: Make sure Row Level Security policies are set correctly


