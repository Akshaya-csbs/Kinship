@echo off
rem Stops the background Kinship server.
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name like 'java%%'\" | Where-Object { $_.CommandLine -like '*kinship-app*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host ('Stopped Kinship (PID ' + $_.ProcessId + ')') }"
pause
