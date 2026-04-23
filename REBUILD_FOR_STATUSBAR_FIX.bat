@echo off
echo ========================================
echo  Arena Pro - Rebuild for StatusBar Fix
echo ========================================
echo.
echo This will clear cache and restart Expo
echo to apply the StatusBar configuration changes.
echo.
echo IMPORTANT:
echo 1. After this runs, DELETE the app from your iPhone
echo 2. Then reinstall it from Expo Go
echo 3. The status bar should now show dark icons on light backgrounds
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo Stopping any running Metro bundler...
taskkill /F /IM node.exe 2>nul

echo.
echo Clearing Expo cache...
npx expo start -c

echo.
echo ========================================
echo  Next Steps:
echo ========================================
echo 1. DELETE Arena Pro app from your iPhone
echo 2. REINSTALL from Expo Go
echo 3. Open the app and check status bar
echo.
echo The status bar should now show:
echo - Dark/Black icons on light backgrounds
echo - White icons on dark backgrounds
echo ========================================
pause
