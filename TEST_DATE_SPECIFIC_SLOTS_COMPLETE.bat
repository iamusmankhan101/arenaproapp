@echo off
echo ========================================
echo TESTING DATE-SPECIFIC SLOTS - COMPLETE
echo ========================================
echo.
echo This will test the date-specific time slots functionality
echo to ensure the mobile app shows only admin-configured slots
echo for specific dates.
echo.
echo Testing venue "New" with different dates:
echo - 2026-02-01: Should show 6 slots (17:00-23:00)
echo - 2026-02-02: Should show 14 slots (09:00-23:00) 
echo - 2026-02-03: Should show 17 slots (06:00-23:00)
echo.
echo Running test...
echo.

node test-date-specific-slots.js

echo.
echo ========================================
echo TEST COMPLETE
echo ========================================
echo.
echo If the test shows:
echo - 2026-02-01: 6 slots (17:00-23:00) = SUCCESS
echo - 2026-02-02: 14 slots (09:00-23:00) = SUCCESS
echo - 2026-02-03: 17 slots (06:00-23:00) = SUCCESS
echo.
echo Then the date-specific slots fix is working correctly.
echo.
echo Next steps:
echo 1. Test the actual mobile app
echo 2. Select venue "New" 
echo 3. Choose date February 1st, 2026
echo 4. Verify only 17:00-23:00 slots appear
echo.
pause