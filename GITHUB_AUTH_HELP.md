# GitHub Authentication Help

You're getting a permission error because your local Git is configured with a different GitHub account. Here are your options:

## Option 1: Use GitHub Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name it: "Elixir Tournament Platform"
   - Select scopes: ✅ `repo` (full control of private repositories)
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again!)

2. **Push using the token:**
   ```bash
   git push https://YOUR_TOKEN@github.com/memehft4l-del/Website.git main
   ```
   Replace `YOUR_TOKEN` with your actual token.

## Option 2: Use GitHub CLI (gh)

If you have GitHub CLI installed:

```bash
gh auth login
gh repo set-default memehft4l-del/Website
git push -u origin main
```

## Option 3: Authenticate via Browser

GitHub will prompt you to authenticate when you push. You can:
- Use your browser to sign in
- Or use GitHub Desktop app

## Option 4: Update Git Credentials

Update your Git config to match your GitHub account:

```bash
git config --global user.name "memehft4l-del"
git config --global user.email "your-email@example.com"
```

Then try pushing again.

---

**Quick Fix:** The easiest way is Option 1 - create a token and use it in the push command.


