@echo off
echo ==============================================
echo RESTARTING EXPO WITH CACHE CLEARED
echo This will force the app to load the new .env keys
echo ==============================================

echo Cleaning watchman cache...
watchman watch-del-all

echo Starting Expo with cleared cache...
call npx expo start -c
