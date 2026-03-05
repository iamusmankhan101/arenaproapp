@echo off
echo 🔄 Resetting and starting admin panel...
echo.

REM Change to the admin-web directory
cd /d "%~dp0"
echo 📁 Working directory: %CD%

REM Remove node_modules and package-lock.json
echo 🗑️  Removing node_modules and package-lock.json...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del /q "package-lock.json"

REM Clear npm cache
echo 🧹 Clearing npm cache...
npm cache clean --force

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Reset complete! Starting development server...
echo.
echo 🌐 Open http://localhost:3000 in your browser
echo 🔑 Login with: admin@pitchit.com / admin123
echo.

npm start

pause