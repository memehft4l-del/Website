# Fixing Vercel Deployment Issues

If your site shows "Application error" on Vercel, follow these steps:

## Step 1: Check Environment Variables

**CRITICAL:** Make sure ALL these environment variables are set in Vercel:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add these variables (copy from your `.env.local` file):

```
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=4W7cM6SUuqhv9jp2t3jfmonXzNbDsJt5PCWqt7w1Axa2
NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
NEXT_PUBLIC_SUPABASE_URL=https://cwihyzlbsbbpchkheito.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:**
- Select **"All Environments"** (Production, Preview, Development)
- Make sure there are NO extra spaces or quotes
- Copy values EXACTLY from your `.env.local` file

## Step 2: Redeploy After Adding Variables

After adding environment variables:

1. Go to **Deployments** tab
2. Click **"..."** on your latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete

## Step 3: Check Build Logs

If still not working:

1. Go to **Deployments** → Click on the latest deployment
2. Check **Build Logs** for errors
3. Look for:
   - Missing environment variables
   - Build errors
   - Runtime errors

## Step 4: Common Issues

### Issue: "Module not found: pino-pretty"
- **This is just a warning** - it won't break your site
- You can ignore this warning

### Issue: "Application error: client-side exception"
- Usually means environment variables are missing
- Check Step 1 above
- Make sure all `NEXT_PUBLIC_*` variables are set

### Issue: "Failed to fetch" errors
- Check if Supabase URL and key are correct
- Check if RPC endpoint is working
- Make sure values don't have extra quotes or spaces

## Step 5: Test Locally First

Before deploying, test locally:

```bash
npm run build
npm start
```

If it works locally but not on Vercel, it's almost always missing environment variables.

## Quick Checklist

- [ ] All environment variables added in Vercel
- [ ] Variables set for "All Environments"
- [ ] No extra spaces or quotes in values
- [ ] Redeployed after adding variables
- [ ] Checked build logs for errors

## Still Not Working?

1. Check browser console (F12) for specific errors
2. Share the error message from browser console
3. Check Vercel build logs for server-side errors

