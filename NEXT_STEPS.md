# Next Steps: Deploy Railway Proxy & Configure App

## ✅ What's Done
- ✅ Proxy server code created and pushed to GitHub
- ✅ `/battlelog/:tag` route added to proxy
- ✅ `verifyWinner` function created in main app
- ✅ Code ready for deployment

## 📋 Step-by-Step Checklist

### Step 1: Deploy Railway Proxy

1. **Go to Railway:** https://railway.app
2. **Sign in** with GitHub
3. **Create New Project** → **Deploy from GitHub repo**
4. **Select:** `memehft4l-del/API`
5. **Add Environment Variable:**
   - Key: `CR_API_KEY`
   - Value: Your Clash Royale API key (get from https://developer.clashroyale.com/)
6. **Wait for deployment** (takes 2-3 minutes)
7. **Copy your Railway URL** (e.g., `https://api-proxy-production.up.railway.app`)

### Step 2: Get Your Railway URL

After Railway deploys, you'll get a URL like:
- `https://your-app-name.railway.app` or
- `https://api-proxy-production.up.railway.app`

**Test it:**
```bash
# Test the debug-ip route
curl https://your-railway-url.app/debug-ip

# Should return: {"railway_outbound_ip": "xxx.xxx.xxx.xxx"}
```

### Step 3: Add Railway URL to Your Main App

**In Vercel:**
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add:
   - Key: `NEXT_PUBLIC_CLASH_ROYALE_PROXY_URL`
   - Value: `https://your-railway-url.app` (your actual Railway URL)
   - Environments: **All** (Production, Preview, Development)
3. Click **Save**

**In Local `.env.local` file:**
```bash
# Add this line to your .env.local file
NEXT_PUBLIC_CLASH_ROYALE_PROXY_URL=https://your-railway-url.app
```

### Step 4: Whitelist Railway IP in Clash Royale API

1. **Get Railway IP:**
   ```bash
   curl https://your-railway-url.app/debug-ip
   ```
   Copy the IP address from the response

2. **Whitelist IP:**
   - Go to https://developer.clashroyale.com/
   - Go to your API key settings
   - Add the Railway IP address to the whitelist
   - Save

### Step 5: Test the Integration

**Test locally:**
```bash
# In your main app directory
npm run dev
```

Then test the verifyWinner function in your browser console or create a test page.

**Test in production:**
- After adding the env var in Vercel, redeploy
- Test the "Verify Match" button on an active wager

## 🎯 Quick Reference

**Railway Proxy Routes:**
- `/battlelog/:tag` - Get battle log for a player tag
- `/debug-ip` - Get Railway's outbound IP address

**Main App Function:**
- `verifyWinner(playerATag, playerBTag, proxyUrl)` - Verify match winner

**Environment Variables Needed:**
- Railway: `CR_API_KEY`
- Vercel: `NEXT_PUBLIC_CLASH_ROYALE_PROXY_URL`

## 🐛 Troubleshooting

**If Railway deployment fails:**
- Check that `package.json` has all dependencies
- Check Railway logs for errors
- Make sure `CR_API_KEY` is set

**If proxy returns 401/403:**
- Check that `CR_API_KEY` is correct
- Check that Railway IP is whitelisted in Clash Royale API dashboard

**If verifyWinner doesn't work:**
- Check that `NEXT_PUBLIC_CLASH_ROYALE_PROXY_URL` is set correctly
- Check browser console for errors
- Test Railway URL directly: `https://your-railway-url.app/battlelog/%23ABC123`

## 📝 Notes

- The Railway proxy needs to be running 24/7 (Railway free tier is fine)
- Make sure Railway IP is whitelisted in Clash Royale API dashboard
- The proxy handles URL encoding automatically (`#` → `%23`)
- Battle logs return the last 25 matches, so matches must be recent

