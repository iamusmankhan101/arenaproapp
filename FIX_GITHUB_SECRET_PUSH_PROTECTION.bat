@echo off
echo ========================================
echo GitHub Secret Push Protection Fix
echo ========================================
echo.

echo Step 1: Check the problematic commit
git log --oneline -10
echo.

echo The secret is in commit: 6f421856b6ddc337502cf643c3f917293fe3b1a7
echo File: src/screens/main/MapScreen.Mapbox.js:37
echo.

echo ========================================
echo OPTION 1: Use GitHub's Allow Secret URL
echo ========================================
echo If you're sure this token is revoked/safe, visit:
echo https://github.com/iamusmankhan101/arenaproapp/security/secret-scanning/unblock-secret/3AGMIjpE40yVoEsQ8sFNBFJd1lS
echo.
echo Then retry: git push origin master
echo.

echo ========================================
echo OPTION 2: Remove Secret from History
echo ========================================
echo WARNING: This rewrites git history!
echo.
echo Run these commands:
echo.
echo # Install BFG Repo Cleaner (if not installed)
echo # Download from: https://rtyley.github.io/bfg-repo-cleaner/
echo.
echo # OR use git filter-repo (recommended)
echo pip install git-filter-repo
echo.
echo # Remove the file from history
echo git filter-repo --path src/screens/main/MapScreen.Mapbox.js --invert-paths
echo.
echo # Force push (WARNING: coordinate with team first!)
echo git push origin master --force
echo.

echo ========================================
echo OPTION 3: Revert the Commit
echo ========================================
echo git revert 6f421856b6ddc337502cf643c3f917293fe3b1a7
echo git push origin master
echo.

pause
