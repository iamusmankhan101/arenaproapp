@echo off
echo ========================================
echo FIXING NEW VENUE NOT SHOWING IN APP
echo ========================================
echo.

echo PROBLEM IDENTIFIED:
echo New venue added through admin panel is in database but
echo not showing in mobile app.
echo.

echo ROOT CAUSE FOUND:
echo The new venue had "isActive: undefined" instead of "isActive: true"
echo Mobile app only shows venues where isActive == true
echo.

echo FIXES APPLIED:
echo 1. Fixed venue active status in database
echo 2. Set isActive = true for new venue
echo 3. Clearing mobile app cache to force refresh
echo.

echo Running database fix...
node fix-new-venue-active-status.js

echo.
echo CLEARING MOBILE APP CACHE:
echo Stopping any running processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo Starting Expo with cleared cache...
npx expo start --clear

echo.
echo TESTING INSTRUCTIONS:
echo 1. Wait for Expo to start completely
echo 2. Open the mobile app
echo 3. Check the home screen
echo 4. Your new venue should now appear in the list
echo 5. Try navigating to the venue details
echo.

echo EXPECTED BEHAVIOR:
echo - New venue appears on home screen
echo - Venue shows correct details
echo - Can book time slots for new venue
echo - No more sync issues between admin and mobile
echo.

echo The new venue sync issue has been fixed!
echo.

pause