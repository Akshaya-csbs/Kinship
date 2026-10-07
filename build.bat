@echo off
rem One-time build: website (dist\) + Java server (target\kinship-app-1.0.0.jar)
cd /d "%~dp0"
echo [1/3] Installing website packages (first time can take a few minutes)...
call npm install || goto :fail
echo [2/3] Building the website...
call npm run build || goto :fail
echo [3/3] Building the Java server...
call mvn -q -DskipTests package || goto :fail
echo.
echo Build finished. Now run install-autostart.bat (once) or run-kinship.bat.
pause
exit /b 0
:fail
echo.
echo Build failed - scroll up to see the error.
pause
exit /b 1
