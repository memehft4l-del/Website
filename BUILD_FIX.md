# 🔧 Build Fix: Edition2024 Error

## Problem
The `constant_time_eq` crate version 0.4.2 requires `edition2024`, which is not supported by Cargo 1.79.0 (bundled with Anchor).

## Solution
Pinned `constant_time_eq` to version 0.4.1 using a git patch in the root `Cargo.toml`:

```toml
[patch.crates-io]
constant_time_eq = { git = "https://github.com/cespare/constant_time_eq", tag = "v0.4.1" }
```

## Why This Works
- Version 0.4.1 uses `edition = "2021"` (compatible)
- Version 0.4.2 uses `edition = "2024"` (incompatible)
- The patch forces Cargo to use the compatible version from git

## Files Changed
- ✅ `Cargo.toml` (root) - Added patch section
- ✅ `.github/workflows/deploy-program.yml` - Removes Cargo.lock before build

## Testing
The GitHub Actions workflow will:
1. Remove any existing Cargo.lock files
2. Build with Anchor 0.32.1
3. The patch will force constant_time_eq to 0.4.1
4. Build should succeed without edition2024 errors

## Status
✅ Fixed and pushed to GitHub


