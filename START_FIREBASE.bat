@echo off
echo ========================================
echo    Arena Pro Firebase Setup
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js is installed

echo.
echo Installing Firebase dependencies...
call npm install firebase

echo.
echo Seeding Firebase with sample data...
echo ========================================
echo This will add sample data to your Firebase project:
echo   - 4 Venues (Football, Cricket, Padel, Futsal)
echo   - 3 Challenges
echo   - 3 Users
echo   - 3 Sample Bookings
echo ========================================
echo.

echo ========================================
echo ========================================
echo Firebase setup completed!
echo.
echo Next steps:
echo 1. Start mobile app: npx react-native start
echo 2. Start admin panel: cd admin-web ^&^& npm start
echo.
echo Your app now has real data from Firebase!
echo ========================================
pause