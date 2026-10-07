@echo off
rem Started hidden at Windows login by the Startup-folder script. Waits for MySQL, then runs the server.
cd /d "%~dp0.."
for /l %%i in (1,1,60) do (
  powershell -NoProfile -Command "exit [int](-not (Test-NetConnection localhost -Port 3306 -InformationLevel Quiet -WarningAction SilentlyContinue))" && goto :mysql_up
  timeout /t 5 /nobreak >nul
)
:mysql_up
java -jar target\kinship-app-1.0.0.jar > kinship.log 2>&1
