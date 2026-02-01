@echo off
echo 🚀 Starting PitchIt Admin Web Panel...
echo 📁 Current directory: %CD%

REM Change to the admin-web directory
cd /d "%~dp0"
echo 📁 Changed to: %CD%

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found! Make sure you're in the admin-web directory.
    pause
    exit /b 1
)

REM Check if node_modules exists, install if not
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo ✅ Starting React development server...
echo 🌐 Open http://localhost:3000 in your browser
echo 🔑 Login with: admin@pitchit.com / admin123
echo.

npm start

pause