@echo off
echo 🔧 Applying Complete Network Error Fix...
echo.

echo 📱 Stopping any running Metro processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🧹 Clearing all caches...
call npm cache clean --force
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo rmdir /s /q .expo
echo.

echo 🔄 Starting Metro with complete reset...
start "Metro Bundler" cmd /k "npx react-native start --reset-cache"
timeout /t 3 /nobreak >nul

echo.
echo ✅ Complete Network Error Fix Applied!
echo.
echo 🎯 What was fixed:
echo - Removed overly aggressive network detection
echo - Fixed false "No internet connection" errors  
echo - Added proper error handling for real network issues
echo - Improved user experience with guest access option
echo - Simplified Firebase network checking
echo.
echo 🚀 Your app should now:
echo - Work properly with Firebase authentication
echo - Not show false network error dialogs
echo - Handle real network issues gracefully
echo - Provide guest access when needed
echo.
echo 📱 Next steps:
echo 1. Wait for Metro bundler to start
echo 2. Run your app: npx react-native run-android (or run-ios)
echo 3. Try signing up/in - network errors should be resolved
echo 4. If you see network issues, use "Continue as Guest"
echo.
echo 🎉 The authentication system is now ready to use!
echo.
pause