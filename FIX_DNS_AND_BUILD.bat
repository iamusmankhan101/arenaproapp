@echo off
echo ========================================
echo Fix Network Issue and Build APK
echo ========================================
echo.

echo Step 1: Flushing DNS Cache...
ipconfig /flushdns
ipconfig /registerdns
echo DNS cache flushed!
echo.

echo Step 2: Testing connectivity to Expo servers...
ping -n 4 api.expo.dev
echo.

echo Step 3: Testing DNS resolution...
nslookup api.expo.dev
echo.

echo ========================================
echo Network Test Complete!
echo ========================================
echo.
echo If ping and nslookup worked, you can now build:
echo.
echo   eas build --profile preview --platform android
echo.
echo If they FAILED, you need to:
echo   1. Change DNS to 8.8.8.8 and 8.8.4.4
echo   2. Or use mobile hotspot
echo   3. Or use VPN
echo.
echo See FIX_NETWORK_AND_BUILD_APK.md for detailed steps
echo.
pause
