@echo off
echo.
echo ========================================
echo Testing SpaceMail Configuration
echo ========================================
echo.
echo Your SpaceMail credentials:
echo Host: mail.spacemail.com
echo Port: 465 (SSL)
echo Email: support@arenapropk.online
echo.
echo Running test...
echo.

node test-backend-email-setup.js

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo If successful, check your inbox at:
echo support@arenapropk.online
echo.
pause
