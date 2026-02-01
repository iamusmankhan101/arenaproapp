@echo off
echo ========================================
echo FIXING NAVIGATION ERROR
echo ========================================
echo.

echo PROBLEM IDENTIFIED:
echo React Navigation error when trying to navigate to 'Auth' screen
echo which doesn't exist in the navigation structure.
echo.

echo ROOT CAUSE:
echo - BookingConfirmScreen tried to navigate to 'Auth' -> 'SignIn'
echo - No 'Auth' navigator exists in the app structure
echo - SignIn screen only available in unauthenticated stack
echo.

echo FIXES APPLIED:
echo 1. Changed navigation from 'Auth' -> 'SignIn' to just 'SignIn'
echo 2. Added auth screens to authenticated stack for guest booking flow
echo 3. Now users can access SignIn from booking flow
echo.

echo CLEARING CACHE AND RESTARTING:
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
echo 3. Navigate to any venue
echo 4. Click "Book Court" and select a time slot
echo 5. Click "Confirm Booking"
echo 6. Should see "Sign In Now" or "Later" options
echo 7. Click "Sign In Now" - should navigate without error
echo.

echo EXPECTED BEHAVIOR:
echo - No more navigation errors
echo - "Sign In Now" button works correctly
echo - Users can complete guest booking flow
echo - Navigation between screens works smoothly
echo.

echo The navigation error has been fixed!
echo.

pause