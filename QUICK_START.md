# Quick Start: Deploy to Vercel via GitHub

Follow these simple steps to get your $ELIXIR Tournament Platform live!

## Step 1: Commit Your Code

Run this in your terminal:

```bash
cd /Users/biggucci/ClashRoyale
git add .
git commit -m "Initial commit: $ELIXIR Tournament Platform"
```

Or use the setup script:
```bash
./.github-setup.sh
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `elixir-tournament-platform` (or your choice)
3. **DO NOT** check "Initialize with README" (we already have one)
4. Click "Create repository"

## Step 3: Push to GitHub

GitHub will show you commands. Copy and run these:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repo name.

## Step 4: Deploy to Vercel

1. Go to https://vercel.com and sign in (use GitHub)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

## Step 5: Add Environment Variables

**CRITICAL:** Before clicking "Deploy", add these in Vercel:

1. Click "Environment Variables" in project settings
2. Add each variable:

```
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=YOUR_TOKEN_ADDRESS
NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CLASH_ROYALE_API_TOKEN=your-api-token
```

**Where to find these:**
- Check your `.env.local` file (don't commit this file!)
- Or see `DEPLOYMENT.md` for details

## Step 6: Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes
3. Your site will be live at `your-project.vercel.app`

## ✅ Done!

Your tournament platform is now live! Share the Vercel URL with your community.

## 🔄 Updating Your Site

After making changes:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy!

## 📖 Need More Help?

See `DEPLOYMENT.md` for detailed instructions and troubleshooting.

