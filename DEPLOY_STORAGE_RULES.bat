@echo off
echo ========================================
echo   DEPLOYING FIREBASE STORAGE RULES
echo ========================================
echo.

echo Deploying storage rules to Firebase...
firebase deploy --only storage

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE
echo ========================================
echo.
echo Storage rules have been updated!
echo Users can now upload payment screenshots.
echo.
pause
