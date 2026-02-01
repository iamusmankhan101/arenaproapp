@echo off
echo ========================================
echo    Clearing Admin Panel Cache
echo ========================================
echo.

echo Stopping any running admin panel...
taskkill /f /im node.exe 2>nul

echo.
echo Clearing build cache...
cd admin-web
if exist build rmdir /s /q build
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .eslintcache del .eslintcache

echo.
echo Clearing browser cache instructions:
echo 1. Open Chrome DevTools (F12)
echo 2. Right-click refresh button
echo 3. Select "Empty Cache and Hard Reload"
echo.
echo OR press Ctrl+Shift+R for hard refresh
echo.

echo Reinstalling dependencies...
call npm install

echo.
echo Starting admin panel with fresh cache...
set GENERATE_SOURCEMAP=false
call npm start

echo.
echo ========================================
echo Cache cleared and admin panel restarted!
echo.
echo If you still see errors:
echo 1. Press Ctrl+Shift+R in browser
echo 2. Or open DevTools and disable cache
echo ========================================
pause