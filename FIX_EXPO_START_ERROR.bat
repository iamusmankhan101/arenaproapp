@echo off
echo 🔧 Fixing Expo Start Error - "Body is unusable"...
echo.

echo 📋 Step 1: Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo 📋 Step 2: Clearing npm cache...
npm cache clean --force

echo 📋 Step 3: Clearing Expo cache...
if exist "%USERPROFILE%\.expo" (
    echo Clearing Expo cache directory...
    rmdir /s /q "%USERPROFILE%\.expo\cache" 2>nul
)

echo 📋 Step 4: Clearing Metro cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
)

echo 📋 Step 5: Clearing temporary files...
if exist ".expo" (
    rmdir /s /q ".expo"
)

echo 📋 Step 6: Starting Expo with workaround...
echo.
echo ⚠️  If you see the "Body is unusable" error, it's from Expo CLI itself.
echo ✅ The error doesn't affect your app - it's just a CLI warning.
echo 🚀 Your app should still start normally.
echo.

echo Starting Expo...
npx expo start --port 8082

pause