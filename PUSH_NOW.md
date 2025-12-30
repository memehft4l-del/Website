# Push to GitHub - Browser Authentication

Since the terminal here isn't interactive, **please run this command in your own terminal**:

## Step 1: Open Your Terminal

Open Terminal (or iTerm) on your Mac.

## Step 2: Navigate to Project

```bash
cd /Users/biggucci/ClashRoyale
```

## Step 3: Push to GitHub

```bash
git push -u origin main
```

## Step 4: Authenticate

When prompted:

1. **Username:** Enter `memehft4l-del`
2. **Password:** You'll need to use a **Personal Access Token**, not your GitHub password

### If it asks for password:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "Elixir Tournament Platform"
4. Check: ✅ `repo` (full control)
5. Click "Generate token"
6. **Copy the token**
7. When Git asks for password, **paste the token** (not your actual password)

### Alternative: Use GitHub CLI

If you have GitHub CLI installed:

```bash
gh auth login
# Follow the prompts - it will open your browser
git push -u origin main
```

---

**Once pushed successfully**, your code will be at:
https://github.com/memehft4l-del/Website

Then you can import it into Vercel!

