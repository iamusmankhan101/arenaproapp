@echo off
echo ========================================
echo    ULTIMATE FIREBASE ADMIN FIX
echo ========================================
echo.

echo ✅ Enhanced Firebase initialization with retry logic
echo ✅ Added proper async/await patterns for all functions
echo ✅ Added fallback data for all Firebase operations
echo ✅ Updated security rules for development
echo.

echo Stopping admin panel...
taskkill /f /im node.exe 2>nul

echo.
echo Clearing all caches and temporary files...
cd admin-web
if exist build rmdir /s /q build
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .eslintcache del .eslintcache
if exist src\*.hot-update.* del src\*.hot-update.*

echo.
echo Clearing browser storage (you'll need to do this manually):
echo 1. Open Chrome DevTools (F12)
echo 2. Go to Application tab
echo 3. Click "Clear storage" on the left
echo 4. Click "Clear site data"
echo.

echo Reinstalling dependencies...
call npm install

echo.
echo ========================================
echo CRITICAL: Clear your browser completely!
echo ========================================
echo.
echo Method 1: Incognito Mode (Recommended)
echo - Open new incognito/private window
echo - Go to http://localhost:3000
echo.
echo Method 2: Clear Everything
echo - Press Ctrl+Shift+Delete
echo - Select "All time"
echo - Check all boxes
echo - Click "Clear data"
echo.
echo Method 3: Hard Reset
echo - Close all browser windows
echo - Restart browser
echo - Press Ctrl+Shift+R when page loads
echo.

pause
echo.
echo Starting admin panel with enhanced Firebase support...
set GENERATE_SOURCEMAP=false
set REACT_APP_USE_FIREBASE=true
call npm start

echo.
echo ========================================
echo Ultimate Firebase Fix Applied!
echo.
echo What was fixed:
echo 1. Firebase initialization with retry logic
echo 2. Proper async/await for all database calls
echo 3. Fallback data if Firebase fails
echo 4. Enhanced error handling and logging
echo 5. Development-friendly security rules
echo.
echo Login credentials:
echo Email: admin@pitchit.com
echo Password: admin123
echo.
echo Expected console output:
echo "🔥 Initializing Firebase for admin panel..."
echo "✅ Firebase initialized successfully"
echo "🔥 Fetching dashboard stats from Firebase..."
echo "✅ Dashboard stats fetched successfully"
echo ========================================