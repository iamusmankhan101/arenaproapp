@echo off
echo ========================================
echo  Arena Pro - Restart with New Fonts
echo ========================================
echo.
echo This will:
echo 1. Clear Metro bundler cache
echo 2. Restart Expo with new ClashDisplay fonts
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo Clearing Metro cache...
npx expo start -c

echo.
echo ========================================
echo  Done! The app should now use ClashDisplay fonts
echo ========================================
pause
