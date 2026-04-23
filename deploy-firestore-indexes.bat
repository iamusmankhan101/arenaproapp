@echo off
echo ========================================
echo Deploying Firestore Indexes
echo ========================================
echo.

echo This will deploy the Firestore indexes defined in firestore.indexes.json
echo.

firebase deploy --only firestore:indexes

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo The notifications index has been deployed.
echo You can also view and manage indexes at:
echo https://console.firebase.google.com/project/arena-pro-97b5f/firestore/indexes
echo.
pause
