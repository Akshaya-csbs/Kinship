@echo off
rem Makes Kinship start automatically (hidden) every time you log in to Windows, and starts it now.
cd /d "%~dp0"
if not exist target\kinship-app-1.0.0.jar (echo Run build.bat first. & pause & exit /b 1)
if not exist dist\index.html (echo Run build.bat first. & pause & exit /b 1)
if not exist db.properties (echo Create db.properties with your MySQL password first. & pause & exit /b 1)

set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "VBS=%STARTUP%\Kinship.vbs"
> "%VBS%" echo Set sh = CreateObject("WScript.Shell")
>> "%VBS%" echo sh.Run "cmd /c ""%~dp0deploy\kinship-background.bat""", 0, False

echo Auto-start installed: %VBS%
echo Starting Kinship now...
wscript "%VBS%"
timeout /t 15 /nobreak >nul
start "" http://localhost:8080
echo.
echo Kinship runs in the background at http://localhost:8080
echo It starts by itself whenever you log in. Server log: %~dp0kinship.log
pause
