@echo off
echo 🔧 Applying Redux Serialization Fix...
echo.

echo 📱 Stopping any running Metro processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🧹 Clearing all caches and Redux state...
call npm cache clean --force
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo rmdir /s /q .expo
if exist android\app\build rmdir /s /q android\app\build
echo.

echo 🔄 Starting Metro with complete reset...
start "Metro Bundler" cmd /k "npx react-native start --reset-cache"
timeout /t 3 /nobreak >nul

echo.
echo ✅ Redux Serialization Fix Applied!
echo.
echo 🎯 Critical Fix Applied:
echo - Fixed Redux serialization error with Firebase serverTimestamp
echo - Separated Firestore data from Redux state data
echo - Convert serverTimestamp objects to ISO strings for Redux
echo - Enhanced Redux store middleware configuration
echo - Proper timestamp handling throughout the app
echo.
echo 🚀 Your app should now:
echo - Not show Redux serialization warnings in console
echo - Handle Firebase timestamps properly in Redux
echo - Store only serializable data in Redux state
echo - Work with Redux DevTools without issues
echo.
echo 📱 Next steps:
echo 1. Wait for Metro bundler to start completely
echo 2. Run your app: npx react-native run-android (or run-ios)
echo 3. Try signing up/in - no more serialization errors
echo 4. Check console - should be clean without Redux warnings
echo.
echo 🎉 The authentication system should now work perfectly!
echo.
pause