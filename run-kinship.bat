@echo off
rem Runs Kinship in this window (website + Java API on http://localhost:8080). Close the window to stop.
cd /d "%~dp0"
if not exist target\kinship-app-1.0.0.jar (echo Run build.bat first. & pause & exit /b 1)
if not exist dist\index.html (echo Run build.bat first. & pause & exit /b 1)
start "" http://localhost:8080
java -jar target\kinship-app-1.0.0.jar
pause
