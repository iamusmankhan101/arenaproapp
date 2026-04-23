@echo off
echo ========================================
echo    Fixing Firebase Admin Panel Issues
echo ========================================
echo.

echo ✅ Updated Firebase security rules for development
echo ✅ Added Firebase initialization checks
echo ✅ Enhanced error handling in admin API
echo.

echo Deploying updated Firebase rules...
call firebase deploy --only firestore:rules

echo.
echo Stopping admin panel...
taskkill /f /im node.exe 2>nul

echo.
echo Clearing cache and restarting...
cd admin-web
if exist build rmdir /s /q build
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo Testing Firebase connection...
call node test-firebase-admin.js

echo.
echo Starting admin panel...
call npm start

echo.
echo ========================================
echo Firebase Admin Panel Fix Complete!
echo.
echo What was fixed:
echo 1. Firebase security rules updated for development
echo 2. Added proper error handling for Firebase calls
echo 3. Added initialization checks for db object
echo 4. Cleared cache to ensure fresh start
echo.
echo Login with:
echo Email: admin@pitchit.com
echo Password: admin123
echo ========================================
pause