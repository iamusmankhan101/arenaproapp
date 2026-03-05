@echo off
title PitchIt Admin Panel Startup

echo.
echo ========================================
echo    PitchIt Admin Panel Startup
echo ========================================
echo.

REM Get the directory of this batch file
set "SCRIPT_DIR=%~dp0"
echo Script location: %SCRIPT_DIR%

REM Change to the script directory (admin-web)
cd /d "%SCRIPT_DIR%"
echo Current directory: %CD%

REM Check if we're in the right directory
if not exist "package.json" (
    echo.
    echo ❌ ERROR: package.json not found!
    echo This script must be run from the admin-web directory.
    echo.
    pause
    exit /b 1
)

REM Check if this is the admin web package
findstr /C:"pitchit-admin-web" package.json >nul
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Wrong package.json found!
    echo Make sure you're running this from the admin-web directory.
    echo.
    pause
    exit /b 1
)

echo ✅ Correct directory confirmed!
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo.
        echo ❌ Failed to install dependencies
        echo Try running: npm install
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed!
    echo.
)

echo 🚀 Starting admin panel...
echo.
echo 🌐 The admin panel will open at: http://localhost:3000
echo 🔑 Login credentials:
echo    Email: admin@pitchit.com
echo    Password: admin123
echo.
echo 💡 To stop the server, press Ctrl+C in this window
echo.

REM Start the development server
npm start

echo.
echo 👋 Admin panel stopped.
pause