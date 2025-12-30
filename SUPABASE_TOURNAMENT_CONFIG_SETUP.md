# Tournament Config Setup Guide

This guide explains how to set up the Supabase table for managing tournament tags and passwords dynamically.

## Step 1: Create the Tournament Configs Table

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `SUPABASE_TOURNAMENT_CONFIG.sql`
5. Click **Run** to execute the SQL

This will create:
- `tournament_configs` table
- Default entries for SQUIRE, WHALE, and TGE tournaments
- Row Level Security policies for public read access
- Auto-update trigger for `updated_at` timestamp

## Step 2: Update Tournament Configurations

You can update tournament tags and passwords directly in Supabase:

### Via Supabase Dashboard:
1. Go to **Table Editor** → `tournament_configs`
2. Click on any row to edit
3. Update `tournament_tag` and/or `tournament_password`
4. Click **Save**

### Via SQL:
```sql
-- Update Squire Arena tournament tag and password
UPDATE tournament_configs
SET 
  tournament_tag = '#NEWSQUIRE2024',
  tournament_password = 'NewSquirePass123!'
WHERE tournament_type = 'SQUIRE';

-- Update Whale War tournament tag and password
UPDATE tournament_configs
SET 
  tournament_tag = '#NEWWHALE2024',
  tournament_password = 'NewWhalePass456!'
WHERE tournament_type = 'WHALE';

-- Update TGE tournament tag and password
UPDATE tournament_configs
SET 
  tournament_tag = '#NEWTGE2024',
  tournament_password = 'NewTGEPass789!'
WHERE tournament_type = 'TGE';
```

## Step 3: Deactivate Tournaments

To temporarily disable a tournament:

```sql
UPDATE tournament_configs
SET is_active = false
WHERE tournament_type = 'SQUIRE'; -- or 'WHALE' or 'TGE'
```

To reactivate:

```sql
UPDATE tournament_configs
SET is_active = true
WHERE tournament_type = 'SQUIRE';
```

## How It Works

- The app fetches tournament configurations from Supabase on page load
- If Supabase is unavailable, it falls back to default hardcoded values
- Changes in Supabase are reflected immediately (no code deployment needed)
- All tournament types (SQUIRE, WHALE, TGE) are managed through this table

## Tournament Types

- **SQUIRE**: Regular tournament for Squire tier (500k+ tokens)
- **WHALE**: Regular tournament for Whale tier (2.5M+ tokens)
- **TGE**: Token Generation Event tournament (500k tokens, special launch event)

## Notes

- Tournament configs are cached client-side but refresh on page reload
- The `updated_at` field automatically tracks when configs are modified
- Only active tournaments (`is_active = true`) are fetched by the app


