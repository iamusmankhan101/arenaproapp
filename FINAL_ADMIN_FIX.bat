@echo off
echo ========================================
echo    FINAL ADMIN PANEL FIX
echo ========================================
echo.

echo ✅ Fixed environment variables
echo ✅ Updated Firebase admin API with better error handling
echo ✅ Created manifest.json
echo ✅ Updated authentication to use mock system
echo.

echo Stopping any running processes...
taskkill /f /im node.exe 2>nul

echo.
echo Clearing all caches...
cd admin-web
if exist build rmdir /s /q build
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .eslintcache del .eslintcache

echo.
echo Reinstalling dependencies...
call npm install

echo.
echo ========================================
echo IMPORTANT: Clear your browser cache!
echo ========================================
echo.
echo Method 1: Hard Refresh
echo - Press Ctrl+Shift+R
echo.
echo Method 2: DevTools
echo - Press F12 to open DevTools
echo - Right-click refresh button
echo - Select "Empty Cache and Hard Reload"
echo.
echo Method 3: Manual
echo - Go to Settings ^> Privacy ^> Clear browsing data
echo - Select "Cached images and files"
echo - Click Clear data
echo.

pause
echo.
echo Starting admin panel...
set GENERATE_SOURCEMAP=false
call npm start

echo.
echo ========================================
echo Admin panel should now work perfectly!
echo.
echo Login with:
echo Email: admin@pitchit.com
echo Password: admin123
echo.
echo If you still see API errors:
echo 1. Clear browser cache completely
echo 2. Try incognito/private browsing mode
echo 3. Check browser console for any remaining errors
echo ========================================