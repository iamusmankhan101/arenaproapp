@echo off
echo ========================================
echo    CLEANING MOCK VENUES FROM FIRESTORE
echo ========================================
echo.
echo This will remove old mock/test venues from your database
echo and keep only the venues you added through the admin panel.
echo.
pause

echo Running cleanup script...
node clean-mock-venues.js

echo.
echo ========================================
echo    CLEANUP COMPLETED
echo ========================================
echo.
echo Your mobile app should now only show venues
echo that you added through the admin panel.
echo.
echo Next steps:
echo 1. Restart your mobile app
echo 2. Check the home screen - mock venues should be gone
echo 3. Only your admin-added venues should appear
echo.
pause