# ⚡ Quick Push Instructions

## Ready to Push!

The remote is configured. Just run:

```bash
cd /Users/biggucci/ClashRoyale
git push -u new-repo main
```

**Authentication:**
- Username: `memehft4l-del`
- Password: Your GitHub Personal Access Token

**Get Token:** https://github.com/settings/tokens
- Create new token (classic)
- Select `repo` scope
- Copy and paste as password

## Alternative: Use Token in URL

If you have a token, you can use it directly:

```bash
git push https://YOUR_TOKEN@github.com/memehft4l-del/new.git main
```

Or set it temporarily:
```bash
export GITHUB_TOKEN=your_token_here
git push -u new-repo main
```

## After Push

✅ Code will be at: https://github.com/memehft4l-del/new
✅ Old repo stays untouched
✅ Ready for CI/CD and Vercel deployment
