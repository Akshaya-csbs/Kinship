@echo off
rem Gets the latest code from GitHub, stops the old Kinship server, rebuilds and starts the new version.
cd /d "%~dp0"
echo [1/5] Downloading the latest code...
git pull origin main || goto :fail
echo [2/5] Stopping the old Kinship server...
call "%~dp0deploy\stop-server.bat"
echo [3/5] Installing website packages...
call npm install || goto :fail
echo [4/5] Building the website...
call npm run build || goto :fail
echo [5/5] Building the Java server...
call mvn -q -DskipTests package || goto :fail
echo.
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Kinship.vbs" (
  echo Starting the new version in the background...
  wscript "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Kinship.vbs"
  timeout /t 15 /nobreak >nul
  start "" http://localhost:8080
  echo Updated. Kinship is running at http://localhost:8080
) else (
  echo Updated. Start it with run-kinship.bat ^(http://localhost:8080^)
)
pause
exit /b 0
:fail
echo.
echo Update failed - scroll up to see the error.
pause
exit /b 1
