@echo off
echo ========================================
echo    DEPLOYING FIRESTORE INDEXES
echo ========================================
echo.
echo This will deploy the Firestore indexes to Firebase...
echo.
pause

echo Deploying Firestore indexes...
firebase deploy --only firestore:indexes

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    INDEXES DEPLOYED SUCCESSFULLY!
    echo ========================================
    echo.
    echo Your Firestore indexes have been deployed.
    echo The app should now work without index errors.
    echo.
) else (
    echo.
    echo ========================================
    echo    DEPLOYMENT FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo Make sure you're logged into Firebase CLI.
    echo.
)

pause