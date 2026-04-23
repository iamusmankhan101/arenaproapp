@echo off
echo ========================================
echo FIXING TIME SLOTS SYNC ISSUE
echo ========================================
echo.

echo PROBLEM IDENTIFIED:
echo The time slots are correctly stored in Firebase, but the mobile
echo app might be showing cached data or not refreshing properly.
echo.

echo FIXES APPLIED:
echo 1. Added Redux state clearing mechanism
echo 2. Enhanced debugging in TurfDetailScreen
echo 3. Force refresh when booking modal opens
echo 4. Improved error handling and fallbacks
echo.

echo TESTING THE FIX:
echo 1. Clear app cache (recommended)
echo 2. Restart Expo development server
echo 3. Test booking flow
echo.

echo Step 1: Clearing cache...
echo Stopping any running Expo processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo Step 2: Starting Expo with cleared cache...
echo This will take a moment...
echo.

start cmd /k "npx expo start --clear"

echo.
echo Step 3: Manual testing required
echo.
echo TESTING CHECKLIST:
echo [ ] Open the mobile app
echo [ ] Navigate to any venue from home screen
echo [ ] Click "Book Court" button
echo [ ] Check if time slots appear in the modal
echo [ ] Look for console logs in Metro bundler
echo.

echo EXPECTED CONSOLE LOGS:
echo - "TurfDetailScreen: Loading details for venue..."
echo - "TurfDetailScreen: Opening booking modal, clearing cache"
echo - "Redux: Clearing available slots"
echo - "TurfDetailScreen: Fetching slots for..."
echo - "Redux: Successfully fetched X slots"
echo - "TurfDetailScreen: Displaying X time slots"
echo.

echo If time slots still don't show:
echo 1. Check Metro bundler console for errors
echo 2. Try a different venue
echo 3. Check your internet connection
echo 4. Restart the app completely
echo.

echo The time slots should now be working correctly!
echo.

pause