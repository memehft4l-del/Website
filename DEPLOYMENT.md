# Deployment Guide for $ELIXIR Tournament Platform

This guide will help you deploy your Next.js application to Vercel via GitHub.

## Prerequisites

- GitHub account
- Vercel account (free tier works great)
- All environment variables ready

## Step 1: Prepare Your Code

### 1.1 Initialize Git Repository

```bash
cd /Users/biggucci/ClashRoyale
git init
git add .
git commit -m "Initial commit: $ELIXIR Tournament Platform"
```

### 1.2 Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it something like `elixir-tournament-platform` or `clashroyale-tournament`
4. **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### 1.3 Push to GitHub

GitHub will show you commands. Run these in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

## Step 2: Deploy to Vercel

### 2.1 Import Project

1. Go to [Vercel](https://vercel.com) and sign in (you can use GitHub to sign in)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project

### 2.2 Configure Environment Variables

**IMPORTANT:** Before deploying, add these environment variables in Vercel:

1. In the project settings, go to "Environment Variables"
2. Add each of these:

```
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=YOUR_TOKEN_ADDRESS_HERE
NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_CLASH_ROYALE_API_TOKEN=your-clash-royale-api-token
```

**Where to find these:**

- **Token Mint Address**: Your $ELIXIR token contract address
- **RPC Endpoint**: Your Helius API key (or use the free public RPC)
- **Supabase URL**: Found in your Supabase project settings → API
- **Supabase Anon Key**: Found in your Supabase project settings → API
- **Clash Royale API Token**: Your Clash Royale API token

### 2.3 Deploy

1. Click "Deploy"
2. Vercel will build and deploy your project
3. You'll get a URL like `your-project.vercel.app`

## Step 3: Post-Deployment Checklist

- [ ] Test wallet connection on production URL
- [ ] Verify Supabase connection works
- [ ] Test tournament signup form
- [ ] Check that token balance displays correctly
- [ ] Verify all navigation tabs work
- [ ] Test the Rules page (`/rules`)
- [ ] Check mobile responsiveness

## Step 4: Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS instructions

## Troubleshooting

### Build Fails

- Check that all environment variables are set in Vercel
- Review build logs in Vercel dashboard
- Ensure `package.json` has all dependencies

### Wallet Not Connecting

- Make sure `NEXT_PUBLIC_RPC_ENDPOINT` is set correctly
- Check browser console for errors
- Verify wallet adapter is properly configured

### Supabase Errors

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Review Supabase logs for RLS (Row Level Security) issues

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Check the build logs in Vercel dashboard for specific errors

