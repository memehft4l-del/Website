# Technical Checklist - Production Readiness

This document outlines all technical details that need to be configured for the application to work properly in production.

## 🔴 Critical - Must Configure

### 1. Environment Variables (Vercel)

**Location:** Vercel Dashboard → Settings → Environment Variables

**Required Variables:**
```env
# Solana Configuration
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=your_token_address_here
NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_WAGER_ESCROW_PROGRAM_ID=CA4ADsMYjuCQMsGfHuxHzcn4s6VuiQCtT49MGCLANEvb

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Configuration
NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=EUFx61xAt5DjAZc8GmQRr5kg7KmWqxJCjXvJ3Eikz4H4
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password_here

# Clash Royale API Proxy
NEXT_PUBLIC_CLASH_ROYALE_PROXY_URL=https://api-production-0e8d.up.railway.app
```

**Action Items:**
- [ ] Add all variables to Vercel (Production, Preview, Development)
- [ ] Verify no extra spaces or quotes
- [ ] Redeploy after adding variables

### 2. Supabase Database Setup

**Location:** Supabase Dashboard → SQL Editor

**Required Actions:**
- [ ] Run `SUPABASE_GAMES_SCHEMA.sql` to create all tables
- [ ] Verify tables exist: `wagers`, `user_profiles`, `tournament_signups`, `leaderboard` view
- [ ] Enable Row Level Security (RLS) policies
- [ ] Set up real-time subscriptions if needed

**Tables to Verify:**
- [ ] `wagers` table with all columns
- [ ] `user_profiles` table with referral columns
- [ ] `tournament_signups` table
- [ ] `leaderboard` view (auto-generated)

### 3. Railway Proxy Server (Clash Royale API)

**Location:** Railway Dashboard → Your Project → Variables

**Required Environment Variables:**
```env
CR_API_KEY=your_clash_royale_api_key
PORT=3000
```

**Action Items:**
- [ ] Deploy proxy server to Railway
- [ ] Add `CR_API_KEY` environment variable
- [ ] Whitelist Railway IP in Clash Royale API dashboard
- [ ] Test `/debug-ip` endpoint to get Railway IP
- [ ] Verify `/battlelog/:tag` and `/players/:tag` routes work
- [ ] Update `NEXT_PUBLIC_CLASH_ROYALE_PROXY_URL` in Vercel with Railway URL

**Railway Deployment Steps:**
1. Connect GitHub repo to Railway
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add environment variables
5. Deploy

### 4. Supabase Edge Functions (Optional - for future features)

**Location:** Supabase Dashboard → Edge Functions

**Functions:**
- [ ] `verify-match` - Verify Clash Royale match results
- [ ] `cancel-wager` - Cancel and refund wagers

**Required Environment Variables:**
```env
SOLANA_BACKEND_PRIVATE_KEY=[your_private_key_array]
WAGER_ESCROW_PROGRAM_ID=CA4ADsMYjuCQMsGfHuxHzcn4s6VuiQCtT49MGCLANEvb
RPC_ENDPOINT=https://api.mainnet-beta.solana.com
CLASH_ROYALE_PROXY_URL=https://api-production-0e8d.up.railway.app
```

## 🟡 Important - Should Configure

### 5. Solana Network Configuration

**For Production:**
- [ ] Switch `NEXT_PUBLIC_SOLANA_NETWORK` to `mainnet-beta`
- [ ] Use Mainnet RPC endpoint (Helius recommended)
- [ ] Verify admin wallet has sufficient SOL for transactions
- [ ] Test wallet connections on Mainnet

**For Testing:**
- [ ] Use Devnet for initial testing
- [ ] Get Devnet SOL from faucet
- [ ] Test all wallet operations

### 6. Admin Wallet Setup

**Requirements:**
- [ ] Admin wallet address: `EUFx61xAt5DjAZc8GmQRr5kg7KmWqxJCjXvJ3Eikz4H4`
- [ ] Fund wallet with sufficient SOL for payouts
- [ ] Set up wallet monitoring/alerts
- [ ] Secure private key (never commit to git)
- [ ] Configure password protection for admin dashboard

### 7. Security Configuration

**Action Items:**
- [ ] Set strong admin password (`NEXT_PUBLIC_ADMIN_PASSWORD`)
- [ ] Enable Supabase RLS policies
- [ ] Verify API keys are not exposed in client-side code
- [ ] Set up rate limiting (if needed)
- [ ] Configure CORS properly on Railway proxy

### 8. Error Handling & Monitoring

**Recommended:**
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor Supabase errors
- [ ] Monitor Railway proxy errors
- [ ] Set up alerts for failed transactions
- [ ] Log admin actions

## 🟢 Nice to Have - Optimizations

### 9. Performance Optimizations

**Frontend:**
- [ ] Enable Next.js image optimization
- [ ] Implement proper loading states
- [ ] Add error boundaries
- [ ] Optimize bundle size
- [ ] Enable caching headers

**Backend:**
- [ ] Cache Clash Royale API responses
- [ ] Optimize database queries
- [ ] Set up database indexes
- [ ] Implement pagination for large lists

### 10. Analytics & Tracking

**Optional:**
- [ ] Add Google Analytics
- [ ] Track user engagement
- [ ] Monitor conversion rates
- [ ] Track tournament participation

## 📋 Pre-Deployment Checklist

Before going live, verify:

### Frontend (Vercel)
- [ ] All environment variables set
- [ ] Build succeeds without errors
- [ ] All pages load correctly
- [ ] Wallet connection works
- [ ] Navigation works on all pages
- [ ] Mobile responsive design works
- [ ] Admin dashboard accessible with password

### Backend (Supabase)
- [ ] Database schema deployed
- [ ] RLS policies enabled
- [ ] Real-time subscriptions working (if used)
- [ ] Edge functions deployed (if used)

### External Services
- [ ] Railway proxy deployed and accessible
- [ ] Clash Royale API key configured
- [ ] Railway IP whitelisted in Clash Royale API
- [ ] Proxy endpoints tested

### Testing
- [ ] Create a test wager
- [ ] Join a wager
- [ ] Verify match result
- [ ] Test payout flow
- [ ] Test refund flow
- [ ] Test referral system
- [ ] Test points system
- [ ] Test tournament signup

## 🔧 Troubleshooting Common Issues

### Issue: "Failed to fetch" errors
**Solution:**
- Check Supabase URL and key
- Verify Railway proxy URL
- Check CORS configuration
- Verify network connectivity

### Issue: Wallet connection fails
**Solution:**
- Check RPC endpoint
- Verify network (mainnet vs devnet)
- Check wallet adapter configuration
- Verify wallet extension installed

### Issue: Database errors
**Solution:**
- Verify Supabase schema deployed
- Check RLS policies
- Verify table names match
- Check column types

### Issue: Clash Royale API errors
**Solution:**
- Verify API key in Railway
- Check Railway IP whitelist
- Test proxy endpoints directly
- Verify tag format (# replaced with %23)

## 📝 Environment Variable Reference

### Vercel (Frontend)
All variables must start with `NEXT_PUBLIC_` to be accessible in the browser.

### Railway (Proxy)
Variables are server-side only, no `NEXT_PUBLIC_` prefix needed.

### Supabase (Edge Functions)
Variables are server-side only, set in Supabase dashboard.

## 🚀 Deployment Order

1. **Supabase:** Deploy database schema first
2. **Railway:** Deploy proxy server and configure API key
3. **Vercel:** Add all environment variables, then deploy
4. **Testing:** Test all functionality end-to-end
5. **Monitoring:** Set up error tracking and alerts

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Railway Docs:** https://docs.railway.app
- **Solana Docs:** https://docs.solana.com
- **Clash Royale API:** https://developer.clashroyale.com

---

**Last Updated:** Check this document before each deployment to ensure all items are configured.

