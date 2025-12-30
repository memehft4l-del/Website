# Clash Royale API Setup Guide

## Getting Your API Token

1. **Go to Clash Royale API Portal**: https://developer.clashroyale.com/
2. **Sign in** with your Supercell ID (or create one)
3. **Create a new API key**:
   - Click "Create New Key"
   - Give it a name (e.g., "$ELIXIR Tournament Monitor")
   - **IMPORTANT**: Whitelist the proxy IP: `45.79.218.79`
   - Copy the API token
4. **Add to `.env.local`**:
   ```
   NEXT_PUBLIC_CLASH_ROYALE_API_TOKEN=your_token_here
   ```
5. **Restart your dev server**: `npm run dev`

## Using Proxy Server

We're using the proxy server from [RoyaleAPI](https://github.com/AndreVarandas/clash-royale-api) to avoid IP restrictions:
- **Proxy URL**: `https://proxy.royaleapi.dev/v1`
- **Proxy IP**: `45.79.218.79` (must be whitelisted in your API key settings)

This allows the API to work from any IP address without CORS issues.

## How It Works

The Tournament Monitor will:
1. Fetch all signups from Supabase
2. For each player, query the Clash Royale API using their username/tag
3. Display player stats including:
   - Current Trophies
   - Total Wins
   - Player Level
   - And more stats from the API

## Important Notes

- **Rate Limiting**: The API has rate limits. The code includes a 1-second delay between requests to avoid hitting limits.
- **Player Tags**: Players need to provide their Clash Royale player tag (the # code) or username. The system will try to format it correctly.
- **API Token**: Keep your API token secure. It's safe to use `NEXT_PUBLIC_` prefix since it's needed client-side, but don't commit it to public repos.

## Player Tag Format

Players should provide their Clash Royale player tag in one of these formats:
- `#ABC123XYZ` (with #)
- `ABC123XYZ` (without #)
- The system will automatically format it correctly

## Troubleshooting

If player stats aren't loading:
1. Verify the API token is correct in `.env.local`
2. Check browser console for API errors
3. Ensure player tags are correct (they're case-sensitive)
4. Check API rate limits - you may need to wait if you've made too many requests

