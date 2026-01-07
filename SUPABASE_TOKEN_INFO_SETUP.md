# Supabase Token Info Setup

This guide will help you set up the `token_info` table in Supabase so you can manage token information dynamically from your Supabase dashboard.

## Step 1: Create the Table

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `SUPABASE_TOKEN_INFO.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

## Step 2: Verify the Table

1. Go to **Table Editor** in the left sidebar
2. You should see `token_info` table
3. Click on it to view the default entry

## Step 3: Update Token Information

You can now update token information directly in Supabase:

1. Go to **Table Editor** → `token_info`
2. Click on the row to edit
3. Update any fields:
   - `contract_address`: Your token contract address
   - `pump_fun_url`: Pump.fun link
   - `jupiter_url`: Jupiter swap link
   - `twitter_url`: Your Twitter/X link (optional)
   - `telegram_url`: Your Telegram link (optional)
   - `dexscreener_url`: DexScreener link
   - `website_url`: Your website URL (optional)
4. Click **Save**

## Step 4: Verify Changes

After updating in Supabase:
1. Refresh your website
2. The Token Info section will automatically show the updated information
3. No code changes needed!

## Table Structure

- `id`: Auto-incrementing primary key
- `token_name`: Token name (e.g., "$ELIXIR")
- `token_symbol`: Token symbol (e.g., "ELIXIR")
- `contract_address`: Solana token contract address
- `pump_fun_url`: Link to Pump.fun
- `jupiter_url`: Link to Jupiter aggregator
- `twitter_url`: Twitter/X link (optional)
- `telegram_url`: Telegram link (optional)
- `dexscreener_url`: DexScreener link
- `website_url`: Website URL (optional)
- `is_active`: Boolean to enable/disable (default: true)

## Notes

- Only one active token info entry should exist (`is_active = true`)
- The website will use the first active entry it finds
- Changes in Supabase are reflected immediately (no deployment needed)
- The contract address is used to generate URLs if they're not provided

