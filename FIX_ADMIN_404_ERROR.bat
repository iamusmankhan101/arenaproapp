@echo off
echo ========================================
echo    FIXING ADMIN PANEL 404 ERROR
echo ========================================
echo.

echo 🔧 Step 1: Stopping any running admin processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 >nul

echo 🧹 Step 2: Clearing admin build cache...
cd admin-web
if exist build rmdir /s /q build
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo ✅ Cache cleared

echo 🔨 Step 3: Rebuilding admin panel...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Check the error above.
    pause
    exit /b 1
)

echo ✅ Admin panel rebuilt successfully!
echo.
echo 📋 NEXT STEPS:
echo 1. Open your browser and clear all cache (Ctrl+Shift+Delete)
echo 2. Or open admin panel in incognito mode
echo 3. Navigate to your admin panel URL
echo 4. The 404 bookings error should be resolved
echo.
echo 🔍 If the error persists:
echo - Check browser Network tab for the exact failing request
echo - Disable browser extensions temporarily
echo - Try a different browser
echo.
pause