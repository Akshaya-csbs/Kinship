@echo off
rem Stops every running Kinship Java server: the jar (run-kinship / auto-start) and "mvn compile exec:java".
powershell -NoProfile -Command "$p = Get-CimInstance Win32_Process -Filter \"Name like 'java%%'\" | Where-Object { $_.CommandLine -like '*kinship-app*' -or $_.CommandLine -like '*exec:java*' }; if ($p) { $p | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host ('Stopped Kinship server (PID ' + $_.ProcessId + ')') } } else { Write-Host 'No Kinship server was running.' }"
