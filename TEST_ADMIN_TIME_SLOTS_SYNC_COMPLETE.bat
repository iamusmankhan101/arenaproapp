@echo off
echo ========================================
echo TESTING ADMIN TIME SLOTS SYNC - COMPLETE
echo ========================================
echo.
echo This will test the admin time slots sync functionality
echo to ensure custom time slots from admin panel appear
echo correctly in the mobile app with proper pricing.
echo.
echo Running comprehensive test...
echo.

node test-admin-time-slots-sync-final.js

echo.
echo ========================================
echo TEST COMPLETE
echo ========================================
echo.
echo If all venues show "SUCCESS: Mobile app would show time slots"
echo then the admin time slots sync is working correctly.
echo.
echo Next steps:
echo 1. Test the actual mobile app by opening a venue
echo 2. Check that time slots appear with correct pricing
echo 3. Verify that only admin-selected slots are shown
echo.
pause