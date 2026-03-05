@echo off
echo ========================================
echo    Testing Firebase Connection
echo ========================================
echo.

echo Installing required packages...
call npm install firebase

echo.
echo Testing connection to Firebase...
call node test-firebase-connection.js

echo.
echo ========================================
echo Test completed!
echo ========================================
pause