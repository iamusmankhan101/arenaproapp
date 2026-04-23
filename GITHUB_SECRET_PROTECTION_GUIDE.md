# GitHub Secret Push Protection - Fix Guide

## Problem
GitHub detected a Mapbox Secret Access Token in your commit history and blocked the push.

**Detected Secret:**
- Commit: `6f421856b6ddc337502cf643c3f917293fe3b1a7`
- File: `src/screens/main/MapScreen.Mapbox.js:37`
- Type: Mapbox Secret Access Token

## Immediate Action Required

### 1. Revoke the Exposed Token
**CRITICAL:** Go to your Mapbox account and revoke this token immediately:
1. Visit https://account.mapbox.com/access-tokens/
2. Find the exposed token
3. Click "Revoke" or "Delete"
4. Generate a new token if needed

### 2. Choose a Fix Method

## Option A: Allow the Secret (Quick - If Token is Already Revoked)

If you've already revoked the token and want to proceed:

1. Visit the GitHub allow URL:
   ```
   https://github.com/iamusmankhan101/arenaproapp/security/secret-scanning/unblock-secret/3AGMIjpE40yVoEsQ8sFNBFJd1lS
   ```

2. Click "Allow secret" on GitHub

3. Retry the push:
   ```bash
   git push origin master
   ```

## Option B: Remove Secret from History (Recommended)

This completely removes the secret from git history.

### Using git filter-repo (Recommended):

```bash
# Install git-filter-repo
pip install git-filter-repo

# Backup your repo first!
cd ..
cp -r "SPORTS VENDOR APP" "SPORTS VENDOR APP.backup"
cd "SPORTS VENDOR APP"

# Remove the file from all history
git filter-repo --path src/screens/main/MapScreen.Mapbox.js --invert-paths

# Force push (WARNING: This rewrites history!)
git push origin master --force
```

### Using BFG Repo Cleaner:

```bash
# Download BFG from: https://rtyley.github.io/bfg-repo-cleaner/

# Run BFG to remove the file
java -jar bfg.jar --delete-files MapScreen.Mapbox.js

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin master --force
```

## Option C: Revert the Commit (Safest)

This keeps history intact but adds a new commit that undoes the problematic one:

```bash
# Revert the commit
git revert 6f421856b6ddc337502cf643c3f917293fe3b1a7

# Push normally
git push origin master
```

## Best Practices Going Forward

1. **Never commit secrets** - Use environment variables instead
2. **Use .env files** - Add them to .gitignore
3. **Use git-secrets** - Install pre-commit hooks to prevent secret commits:
   ```bash
   npm install -g git-secrets
   git secrets --install
   git secrets --register-aws
   ```

4. **Store secrets properly:**
   ```javascript
   // ❌ Bad
   const MAPBOX_TOKEN = 'sk.ey...';
   
   // ✅ Good
   import { MAPBOX_TOKEN } from '@env';
   ```

## Verification

After fixing, verify the secret is gone:

```bash
# Check recent commits
git log --oneline -10

# Search for the token pattern
git log -S "sk.ey" --all

# If empty, you're good!
```

## Need Help?

If you're unsure which option to choose:
- **Option A**: Fast, but secret remains in history (only if already revoked)
- **Option B**: Cleanest, but rewrites history (coordinate with team)
- **Option C**: Safest, but secret remains in old commits (still visible in history)

For a production app, **Option B** is recommended for complete security.
