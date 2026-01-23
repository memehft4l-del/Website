# 🚀 Push to New Repository - Step by Step

## Step 1: Create New Repository on GitHub

1. Go to: https://github.com/new
2. Repository name: `elixir-pump` (or your choice)
3. Description: "Elixir Pump - Clash Royale Tournament & Wagering Platform"
4. Make it **Private** (recommended)
5. **Don't** initialize with README, .gitignore, or license
6. Click **"Create repository"**

## Step 2: Push Your Code

After creating the repo, GitHub will show you commands. Use these:

```bash
cd /Users/biggucci/ClashRoyale

# Add the new remote (replace YOUR_USERNAME with your GitHub username)
git remote add new-repo https://github.com/memehft4l-del/elixir-pump.git

# Push to the new repo
git push -u new-repo main
```

When prompted:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token
  - Get one: https://github.com/settings/tokens
  - Create token with `repo` scope
  - Copy and paste as password

## Step 3: Verify

Check your new repo: https://github.com/memehft4l-del/elixir-pump

## Benefits

✅ Current deployment (`Website` repo) stays untouched
✅ New repo has all latest features
✅ Can deploy separately to Vercel
✅ Can set up CI/CD for building the Solana program

## Alternative: Use GitHub CLI

If you want to authenticate GitHub CLI first:

```bash
gh auth login
# Follow the prompts to authenticate

# Then create repo
gh repo create elixir-pump --private --source=. --remote=new-repo --push
```
