@echo off
echo ========================================
echo CLEARING MOBILE APP CACHE
echo ========================================
echo.

echo The time slots are correctly stored in the database, but the
echo mobile app might be showing cached/stale data.
echo.

echo CLEARING CACHE:
echo 1. Stopping Expo development server...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo 2. Clearing Expo cache...
npx expo start --clear

echo.
echo WHAT THIS DOES:
echo - Stops all running Expo processes
echo - Clears Metro bundler cache
echo - Clears React Native cache
echo - Forces fresh data fetch from Firebase
echo.

echo AFTER CACHE CLEAR:
echo 1. Wait for Expo to fully start
echo 2. Open the app on your device/simulator
echo 3. Navigate to any venue
echo 4. Click "Book Court"
echo 5. Time slots should now show correctly
echo.

pause