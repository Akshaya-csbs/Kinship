@echo off
rem Removes Kinship from Windows start-up (does not delete any data).
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Kinship.vbs" 2>nul && echo Auto-start removed. || echo Auto-start was not installed.
pause
