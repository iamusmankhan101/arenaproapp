@echo off
echo ========================================
echo TESTING TIME SLOTS IN MOBILE APP
echo ========================================
echo.

echo 1. Testing Firebase API directly...
node test-booking-api.js
echo.

echo 2. Starting mobile app for manual testing...
echo Please test the following:
echo - Open any venue from the home screen
echo - Click "Book Court" button
echo - Check if time slots appear in the modal
echo - Look for console logs in Metro bundler
echo.

echo Starting Expo development server...
npx expo start

pause