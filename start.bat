@echo off
rem Starts the Kinship Java backend and the website, then opens the browser.
cd /d "%~dp0"

where mvn >nul 2>nul || (echo Maven was not found. Install it and add its bin folder to PATH. & pause & exit /b 1)
where npm >nul 2>nul || (echo Node.js was not found. Install it from https://nodejs.org & pause & exit /b 1)

if not exist node_modules (
  echo Installing website packages, this happens only once...
  call npm install || (pause & exit /b 1)
)

start "Kinship Java Backend" cmd /k mvn -q compile exec:java
start "Kinship Website" cmd /k npm run dev

echo.
echo Starting... If the "Kinship Java Backend" window asks for your MySQL password, type it there.
echo The browser opens automatically when everything is ready.
:wait
timeout /t 3 /nobreak >nul
powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/system/health -TimeoutSec 2 | Out-Null; Invoke-WebRequest -UseBasicParsing http://localhost:5173 -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 goto wait

start "" http://localhost:5173
echo Kinship is running at http://localhost:5173
echo Close the two server windows to stop it.
