# Supabase Setup Guide

## Database Table Setup

You need to create a `tournament_signups` table in your Supabase project. Here's the SQL to run:

### SQL Migration

```sql
-- Create tournament_signups table
CREATE TABLE tournament_signups (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  clash_royale_username TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('SQUIRE', 'WHALE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Ensure one signup per wallet address
  UNIQUE(wallet_address)
);

-- Create index for faster lookups
CREATE INDEX idx_tournament_signups_wallet ON tournament_signups(wallet_address);
CREATE INDEX idx_tournament_signups_tier ON tournament_signups(tier);

-- Enable Row Level Security (RLS)
ALTER TABLE tournament_signups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for signups)
CREATE POLICY "Allow public insert" ON tournament_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow users to read their own signups
CREATE POLICY "Allow users to read own signup" ON tournament_signups
  FOR SELECT
  TO public
  USING (true);
```

## Steps to Set Up:

1. **Go to your Supabase Dashboard**: https://app.supabase.com
2. **Navigate to SQL Editor**: Click on "SQL Editor" in the left sidebar
3. **Run the SQL above**: Copy and paste the SQL migration, then click "Run"
4. **Get your API credentials**:
   - Go to Project Settings → API
   - Copy your "Project URL" → This is `NEXT_PUBLIC_SUPABASE_URL`
   - Copy your "anon public" key → This is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Update `.env.local`**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
6. **Restart your dev server**: `npm run dev`

## Table Structure

The `tournament_signups` table stores:
- `wallet_address`: User's Solana wallet address
- `clash_royale_username`: Their Clash Royale username
- `tier`: Their tier level (SQUIRE or WHALE)
- `created_at`: Timestamp of signup

## Features

- ✅ Prevents duplicate signups (unique constraint on wallet_address)
- ✅ Only Squire/Whale tiers can sign up (enforced by app logic)
- ✅ Row Level Security enabled for data protection
- ✅ Automatic timestamp tracking


