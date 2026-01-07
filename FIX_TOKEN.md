# Fix GitHub Token Permissions

Your token works for API calls but needs `repo` scope to push code.

## Create a New Token with Correct Permissions

1. **Go to:** https://github.com/settings/tokens
2. **Click:** "Generate new token" → "Generate new token (classic)"
3. **Name:** "Elixir Tournament Platform - Push Access"
4. **Select scopes:** ✅ **`repo`** (Full control of private repositories)
   - This includes: repo:status, repo_deployment, public_repo, repo:invite, security_events
5. **Click:** "Generate token"
6. **Copy the new token**

## Then Push Using the New Token

```bash
cd /Users/biggucci/ClashRoyale
git push https://YOUR_NEW_TOKEN@github.com/memehft4l-del/Website.git main
```

Or update the remote:

```bash
git remote set-url origin https://YOUR_NEW_TOKEN@github.com/memehft4l-del/Website.git
git push -u origin main
```

---

**Current token status:** ✅ Works for API calls, ❌ Missing `repo` scope for pushing

